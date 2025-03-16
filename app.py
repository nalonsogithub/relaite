from dotenv import load_dotenv
load_dotenv()

from flask import session
from flask_cors import CORS
from flask import stream_with_context, Response
from flask import send_from_directory
from flask import redirect
import json
import datetime
import time
from azure_blob_utils import blob_upload, return_blob_base_listing_url, blob_delete_by_prefix
import site_admin_utils as admin
import datetime as dt
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
import re
import random
from openai import AssistantEventHandler, OpenAI
from azure.communication.email import EmailClient
import queue
from pathlib import Path
import qrcode
from io import BytesIO
import base64
from urllib.parse import urlparse, urlunparse
import os
import requests
import psycopg2
import traceback
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash
from werkzeug.utils import safe_join
import logging

# TURN OFF COM AND GPT RESPONSE
no_com = False
no_gpt = False

# load_dotenv()

app = Flask(__name__, static_folder='react_frontend2/build', static_url_path='/')
# Set up logging for Azure
# 🔹 Force Flask to use Gunicorn's logging
gunicorn_logger = logging.getLogger("gunicorn.error")
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(logging.INFO)  # Always log INFO level and above



app.secret_key = os.environ.get('SECRET_FLASK_KEY')

CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5000", "http://localhost:3000", "https://hbb-zzz.azurewebsites.net",
                "https://www.aigenttechnologies.net",
                "https://www.openhouseaigent.com"]}})

# OPEN AI CLIENT
api_key = os.getenv('OPENAI_API_KEY2')
print(api_key)
organizational_id = os.getenv('ORGANIZATIONAL_ID')
client = OpenAI(api_key=api_key, organization=organizational_id)
message_queue = queue.Queue()

uid_pattern = re.compile(r'^[a-f0-9-]{32,36}$')


def override(method):
    return method


class EventHandler(AssistantEventHandler):
    def __init__(self, queue):
        super().__init__()
        self.queue = queue

    @override
    def on_text_created(self, text) -> None:
        print(f"\nassistant > ", end="", flush=True)

    @override
    def on_text_delta(self, delta, snapshot):
        message = delta.value
        if message:
            self.queue.put(message)

    @override
    def on_tool_call_created(self, tool_call):
        print(f"\nassistant > {tool_call.type}\n", flush=True)

    @override
    def on_message_done(self, message) -> None:
        message_content = message.content[0].text
        annotations = message_content.annotations
        citations = []
        for index, annotation in enumerate(annotations):
            message_content.value = message_content.value.replace(
                annotation.text, f"[{index}]"
            )
            if file_citation := getattr(annotation, "file_citation", None):
                cited_file = client.files.retrieve(file_citation.file_id)
                citations.append(f"[{index}] {cited_file.filename}")


# STATE MANAGEMENT FUNCTIONS
def initialize_session_variables():
    print('INITIALIZING SESSION VARIABLES')
    session.modified = True
    # initialize session variables
    # USER IDENTIFIERS
    session['FIRSTNAME'] = ""
    session['LOGGED_IN'] = 0
    session['EMAIL'] = 0
    session['SUPER_ADMIN'] = False
    session['GENERAL_ASSISTANT_ID'] = os.getenv('GENERAL_ASSISTANT_ID')
    session['SUMMARIZER_ASSISTANT_ID'] = os.getenv('SUMMARIZER_AIGENT_ID')

    # GENERAL CHAT MANAGEMENT
    session['CONVERSATION_CODES'] = ['home']
    session['CONVERSATION_ID'] = 0
    session['LISTING_ID'] = None
    session['MASTER_LISTING_ID'] = None
    session['SESSION_ID'] = None
    session['DEFAULT_LISTING_ID'] = os.getenv('DEFAULT_LISTING_ID')
    session['DEFAULT_ASSISTANT'] = os.getenv('DEFAULT_ASSISTANT')
    session['CHAT_ID'] = None
    session['USER_ID'] = None

    session['OAITHREAD'] = None
    # session['CHAT_CONTEXT'] = ''
    # session['OLD_RESPONSE'] = '' # THIS VARIABLE HELPS TRAP WHEN OPENAI REPEATS
    # session['LAST_QUESTION_TOTAL_FOR_GOTO'] = 0

    session['LOAN_CHAT_LOG'] = ''
    session['LOAN_CHAT_QUESTION_COUNT'] = 0
    session['MORTGAGE_CHAT_LOG'] = ''
    session['MORTGAGE_CHAT_QUESTION_COUNT'] = 0
    session['AFFORDABILITY_CHAT_LOG'] = ''
    session['AFFORDABILITY_CHAT_QUESTION_COUNT'] = 0

    # TRACKING
    session['HOME_VISITED'] = False
    session['LOAN_VISITED'] = False
    session['DOCUMENTS_VISITED'] = False
    session['MORTGAGE_VISITED'] = False
    session['AFFORDABILITY_VISITED'] = False
    session['ASSISTANT_ID'] = ''
    session['QUESTION_COUNT'] = 0
    session['SITE_LOCATION'] = 'default'
    session['OAI_THREAD_ID'] = None
    session['CANCEL_STREAM'] = False
    session['ID_FROM_URL'] = False
    session['RESPONSE_JSON'] = ""

    session['CHAT_INSTRUCTION'] = ""

    # SUMMARY RELATED SESSION VARS
    session['CHAT_LAST_UPDATED'] = datetime(1975, 4, 13, 0, 0, 0).isoformat()
    session['SUMMARY_LAST_UPDATED'] = datetime(1975, 4, 13, 0, 0, 0).isoformat()
    session['DATA_SUMMARY_LAST_UPDATED'] = datetime(1975, 4, 13, 0, 0, 0).isoformat()

    # SITE MAPPINGS
    # session['SITE_ROUTES'] = get_site_mapping()

    return 0



def retrieve_session_variable(variable_name):
    return session[variable_name]


def set_session_variable(variable_name, value):
    print('SETTING VARIABLE', variable_name, value)
    session[variable_name] = value
    session.modified = True
    return 0


# DATABASE FUNCTIONS
def get_db_connection():
    try:
        # Fetch connection details from environment variables
        connection = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        # print("Database connection successful!")
        return connection
    except Exception as e:
        print("Error connecting to the database:", e)
        return None


# CHECK CREDENTIALS FUNCTIONS
def check_credentials_com(email, password):
    if no_com:
        return True
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash, admin FROM t_user WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user:
        stored_password_hash, admin = user  # Unpack the password_hash and admin fields
        is_valid_password = check_password_hash(stored_password_hash, password)
        return is_valid_password, admin
    return False


def get_user_id(email):
    if no_com:
        return 'NOCOM'

    # GET FIRST NAME
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM t_users WHERE email = ?", (email,))
    firstName = cursor.fetchone()
    conn.close()
    return firstName[0]


def initialize_chat_id(email):
    if no_com:
        return 1
    conn = get_db_connection()
    cursor = conn.cursor()

    # CREATE AND RETRIEVE CHAT ID
    sql = 'INSERT INTO t_users_chat_id(email) values(?)'
    cursor.execute(sql, (email,))

    # RETRIEVE CHAT ID
    sql = 'SELECT CHAT_ID from t_users_chat_id where email = ? and CHAT_ID = (SELECT max(CHAT_ID) from t_users_chat_id where email = ?)'
    cursor.execute(sql, (email, email))
    chat_id = cursor.fetchone()[0]

    # SAVE CHAT_ID TO SESSION
    set_session_variable('CHAT_ID', (chat_id,))

    # CREATE A ROW FOR MORTGAGE CALCULATOR DATA SO THAT EMAIL/CHAT_ID HAVE DEFAULT VALUES
    sql = 'INSERT INTO t_mortgage_calculator_data_3(email, chat_id) values(?, ?)'
    cursor.execute(sql, (email, chat_id))
    conn.commit()

    return chat_id


def check_chat_id(email):
    if no_com:
        return True

    conn = get_db_connection()
    cursor = conn.cursor()

    # RETRIEVE CHAT ID
    sql = 'SELECT CHAT_ID from t_users_chat_id where email = ? and CHAT_ID = (SELECT max(CHAT_ID) from t_users_chat_id where email = ?)'
    cursor.execute(sql, (email, email))
    chat_id = cursor.fetchone()

    conn.close()
    if chat_id:
        return True
    else:
        return False


class Text:
    def __init__(self, annotations, value):
        self.annotations = annotations
        self.value = value



def upsert_user_listing(listing_id, user_id, rights='view'):
    try:
        """Tie user to listing."""
        conn = get_db_connection()
        cursor = conn.cursor()

        # CHECK IF THIS ENTRY EXISTS
        sql = 'SELECT user_id FROM t_hbb_user_listing3 where user_id = ? and master_listing_id = ? and rights = ?'
        query = cursor.execute(sql, (user_id, listing_id, rights,)).fetchone()

        if not query:
            sql = 'INSERT INTO t_hbb_user_listing3(user_id, master_listing_id, rights) VALUES(?, ?, ?)'
        cursor.execute(sql, (user_id, listing_id, rights,))
        conn.commit()

    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
    return True



def update_urls_with_directory(details, key_map, subdir=''):
    new_directory = retrieve_session_variable('LISTING_ID')
    if len(subdir) > 0:
        new_directory = new_directory + '/' + subdir

    updated_details = []
    for detail in details:
        for key in key_map:
            if key in detail:
                original_url = detail[key]

                # Ensure the URL has a scheme
                if "://" not in original_url:
                    original_url = "http://" + original_url

                # Parse the URL
                parsed_url = urlparse(original_url)

                # Split the path and insert the new directory
                path_parts = parsed_url.path.split('/')
                path_parts.insert(-1, new_directory)
                new_path = '/'.join(path_parts)

                # Reconstruct the URL with the new path
                new_url = urlunparse(parsed_url._replace(path=new_path))

                detail[key] = new_url
        updated_details.append(detail)
    return updated_details


def get_carousel_images_2(listing_id, carousel_name, subdir=''):
    try:
        if no_com:
            images_json = [{'url': 'JadeSterling.webp',
                            'title': 'AGENT',
                            'conversation_code': 'AGENT',
                            'opening_question': 'DEFAULT',
                            'opening_prompt': 'DEFAULT',
                            'conversation_description': 'DEFAULT',
                            'carousel_subdir': '',
                            'carousel_name': 'main',
                            'conversation_destination': 'main'
                            },
                           {'url': 'SterlingManor.webp',
                            'title': 'HOME',
                            'conversation_code': 'HOME',
                            'opening_question': 'DEFAULT',
                            'opening_prompt': 'DEFAULT',
                            'conversation_description': 'DEFAULT',
                            'carousel_subdir': '',
                            'carousel_name': 'main',
                            'conversation_destination': 'detail'
                            },
                           {'url': 'SterlingManorReno.webp',
                            'title': 'RENO',
                            'conversation_code': 'RENO',
                            'opening_question': 'DEFAULT',
                            'opening_prompt': 'DEFAULT',
                            'conversation_description': 'DEFAULT',
                            'carousel_subdir': '',
                            'carousel_name': 'main',
                            'conversation_destination': 'renovation'
                            }
                           ]  # Access by indices
            key_map = ['url']
            return images_json

        conn = get_db_connection()
        cursor = conn.cursor()

        # SQL query to check if the row exists
        check_query = """
                        SELECT img.image_url, img.image_description, convo.conversation_code, 
                               convo.conversation_starting_question_1 as question, 
                               convo.conversation_starting_prompt_1, 
                               convo.conversation_starting_question_2 as question, 
                               convo.conversation_starting_prompt_2, 
                               convo.conversation_description, 
                               car.carousel_subdir, car.carousel_name,
                               convo.conversation_destination 
                          FROM t_hbb_image as img  
                          JOIN t_hbb_conversation as convo  
                            ON convo.conversation_image_id = img.image_id
                          JOIN t_hbb_carousel as car  
                            ON car.carousel_id = convo.carousel_id
                        WHERE car.listing_id = ?
                          AND car.carousel_name = ?
                        ORDER BY convo.conversation_order

                      """

        cursor.execute(check_query, (listing_id, carousel_name))
        db_res = cursor.fetchall()

        images_json = [{'url': img[0],
                        'title': img[1],
                        'conversation_code': img[2],
                        'opening_question_1': img[3],
                        'opening_prompt_1': img[4],
                        'opening_question_2': img[5],
                        'opening_prompt_2': img[6],
                        'conversation_description': img[7],
                        'carousel_subdir': img[8],
                        'carousel_name': img[9],
                        'conversation_destination': img[10]} for img
                       in
                       db_res]  # Access by indices
        conn.commit()

        key_map = ['url']
        return update_urls_with_directory(images_json, key_map=key_map, subdir=subdir)
    except Exception as e:
        print("An error occurred:", e)
        raise




# UTILITY FUNCTIONS
def get_questions_by_site_location_listing_id(site_location, listing_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
                   SELECT q.question, q.question_prompt
                     FROM t_hbb_listing_site_map_question as q
                     JOIN t_hbb_listing_flow_site_map as map  
                       ON q.site_map_id = map.site_map_id
                     JOIN t_hbb_listing_flow as flow 
                       ON flow.flow_id = map.flow_id
                    WHERE flow.listing_id = ?
                      AND UPPER(map.site_map_location) = ?
                   """
        cursor.execute(query, (listing_id, site_location))
        results = cursor.fetchall()

        # Convert fetchall() result to list of dictionaries
        columns = [column[0] for column in cursor.description]
        questions = [{columns[i]: row[i] for i in range(len(columns))} for row in results]

        # CLOSE DATABASE CONNECTION
        cursor.close()
        conn.close()

        return questions

    except:
        raise


# GET IMAGES FOR CAROUSEL

# GET DOCUMENTS FOR LISTING_ID
def get_documents_for_listing_id(listing_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT doc.document_file_name, doc.document_description, doc.document_purpose, doc.document_data as document_file
              FROM t_hbb_listing_document as doc
             WHERE doc.listing_id = ? 
        """
        cursor.execute(query, (listing_id,))
        results = cursor.fetchall()

        # Convert fetchall() result to list of dictionaries
        columns = [column[0] for column in cursor.description]
        documents = [{columns[i]: row[i] for i in range(len(columns))} for row in results]

        output_strings = []
        for document in documents:
            file_name = os.path.basename(
                document.get('document_file_name', 'N/A'))  # Defaulting to 'N/A' if not present
            purpose = document.get('document_purpose', 'N/A')  # Defaulting to 'N/A' if not present
            output_string = f"The file '{file_name}' {purpose}"
            output_strings.append(output_string)

        # CLOSE DATABASE CONNECTION
        cursor.close()
        conn.close()

        return documents, output_strings
    except:
        raise




# def get_listing_details_2(listing_id):
#     print('get_listing_details_2', listing_id)
#     conn = None
#     cursor = None
#     try:
#
#         blob_url_base = os.getenv('IMAGE_URL') + str(listing_id) + '/'
#         # blob_url_base = IMAGE_URL + str(listing_id) + '/'
#
#         if no_com:
#             details = {
#                 'listing_agent_name': 'DEFAULT',
#                 'listing_description': 'DEFAULT',
#                 'logoImageOne': 'JadeSterling_Logo1.jpg',
#                 'listingImage': 'SterlingManor.webp',
#                 'logoImageTwo': 'JadeSterling_Logo2.jpg'
#             }
#             details = [details]
#             return details
#
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         query = """
#             SELECT det.listing_id,
#                    ag.listing_agent_name,
#                    det.listing_assistant_name,
#                    ag.listing_agent_description,
#                    det.listing_description,
#                    img.image_url as listingImage,
#                    img.image_file_name as listingImage_path,
#                    det.listing_address
#               FROM t_hbb_listing_agent as ag
#               JOIN t_hbb_listing_detail as det
#                 ON ag.listing_id = det.listing_id
#               JOIN t_hbb_image as img
#                 ON img.image_id = det.listing_image_id
#              WHERE det.listing_id = ?
#         """
#         cursor.execute(query, (listing_id,))
#         results = cursor.fetchall()
#
#         # Convert fetchall() result to list of dictionaries
#         columns = [column[0] for column in cursor.description]
#         listing_details = [{columns[i]: row[i] for i in range(len(columns))} for row in results]
#
#         # GET LOGO IMAGES
#         query = """
#             SELECT  q.image_url, q.image_file_name
#               FROM t_hbb_image as q
#               JOIN t_hbb_listing_agent_logo as logo
#                 ON logo.logo_image_id = q.image_id
#               JOIN t_hbb_listing_agent as agent
#                 ON agent.agent_id = logo.agent_id
#              WHERE agent.listing_id = ?
#
#         """
#         cursor.execute(query, (listing_id,))
#         results = cursor.fetchall()
#
#         # Convert fetchall() result to list of dictionaries
#         columns = [column[0] for column in cursor.description]
#         images = [{columns[i]: row[i] for i in range(len(columns))} for row in results]
#
#         if len(images) == 1:
#             listing_details[0]['logoImageOne'] = blob_url_base + images[0]['image_file_name']
#             path = Path(images[0]['image_file_name'])
#             listing_details[0]['logoImageOne_path'] = path.name
#         if len(images) > 1:
#             listing_details[0]['logoImageOne'] = blob_url_base + images[0]['image_file_name']
#             path = Path(images[0]['image_file_name'])
#             listing_details[0]['logoImageOne_path'] = path.name
#             listing_details[0]['logoImageTwo'] = blob_url_base + images[1]['image_file_name']
#             path = Path(images[1]['image_file_name'])
#             listing_details[0]['logoImageTwo_path'] = path.name
#
#         # print('WTF listing_details', listing_details)
#         listing_details[0]['listingImage'] = blob_url_base + listing_details[0]['listingImage_path']
#
#         key_map = ['listingImage', 'logoImageOne', 'logoImageTwo']
#         return listing_details
#     except Exception as e:
#         print(f"Error: {e}")
#         raise
#     finally:
#         # CLOSE DATABASE CONNECTION
#         if cursor:
#             cursor.close()
#         if conn:
#             conn.close()
def get_listing_details_2(listing_id):
    # print(f"[DEBUG] get_listing_details_2 called with listing_id: {listing_id}")
    conn = None
    cursor = None
    try:
        blob_url_base = os.getenv('IMAGE_URL', '') + str(listing_id) + '/'

        conn = get_db_connection()
        cursor = conn.cursor()

        # ✅ Fetch Listing Details
        query = """
            SELECT det.listing_id, 
                   ag.listing_agent_name, 
                   det.listing_assistant_name, 
                   ag.listing_agent_description, 
                   det.listing_description, 
                   img.image_url AS listingImage, 
                   COALESCE(img.image_file_name, '') AS listingImage_path,  -- ✅ Handle NULL values
                   det.listing_address
            FROM t_hbb_listing_agent AS ag  
            JOIN t_hbb_listing_detail AS det ON ag.listing_id = det.listing_id
            LEFT JOIN t_hbb_image AS img ON img.image_id = det.listing_image_id  -- ✅ Use LEFT JOIN in case no image exists
            WHERE det.listing_id = %s
        """
        cursor.execute(query, (listing_id,))
        results = cursor.fetchall()
        # print(f"[DEBUG] get_listing_details_2(), results1: {results}")

        if not results:
            print(f"[DEBUG] No listing found for listing_id: {listing_id}")
            return []

        # Convert to list of dictionaries
        columns = [desc[0] for desc in cursor.description]
        listing_details = [{columns[i]: row[i] for i in range(len(columns))} for row in results]

        # ✅ Check if `listingImage_path` exists
        if 'listingImage_path' in listing_details[0]:
            if listing_details[0]['listingImage_path']:  # Only modify if it's not empty
                listing_details[0]['listingImage'] = blob_url_base + listing_details[0]['listingImage_path']
            else:
                print("[WARNING] listingImage_path is empty, skipping image assignment.")
                listing_details[0]['listingImage'] = None
        else:
            print("[WARNING] listingImage_path is missing in listing_details, skipping image assignment.")

        # ✅ Fetch Logo Images
        query = """
            SELECT q.image_url, q.image_file_name
            FROM t_hbb_image AS q  
            JOIN t_hbb_listing_agent_logo AS logo ON logo.logo_image_id = q.image_id
            JOIN t_hbb_listing_agent AS agent ON agent.agent_id = logo.agent_id
            WHERE agent.listing_id = %s
        """
        cursor.execute(query, (listing_id,))
        results = cursor.fetchall()
        # print(f"[DEBUG] get_listing_details_2(), results2: {results}")

        # Convert to list of dictionaries
        columns = [desc[0] for desc in cursor.description]
        images = [{columns[i]: row[i] for i in range(len(columns))} for row in results]

        # ✅ Assign Logo Images (Only if Available)
        if images:
            listing_details[0]['logoImageOne'] = blob_url_base + images[0]['image_file_name']
            listing_details[0]['logoImageOne_path'] = Path(images[0]['image_file_name']).name if images[0]['image_file_name'] else None
        if len(images) > 1:
            listing_details[0]['logoImageTwo'] = blob_url_base + images[1]['image_file_name']
            listing_details[0]['logoImageTwo_path'] = Path(images[1]['image_file_name']).name if images[1]['image_file_name'] else None

        # print(f"[DEBUG] Successfully fetched listing details: {listing_details}")

        return listing_details

    except Exception as e:
        print(f"[ERROR] Exception in get_listing_details_2: {e}")
        return []

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def get_instruction_from_listing_id(listing_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
                    SELECT insd.instruction_text, insd. instruction_description
                      FROM t_hbb_listing_instruction_detail as insd
                      JOIN t_hbb_listing_instruction as ins
                        ON ins.instruction_id = insd.instruction_id
                     WHERE ins.listing_id = ?
                """
        cursor.execute(query, (listing_id,))
        results = cursor.fetchall()

        # Convert fetchall() result to list of dictionaries
        columns = [column[0] for column in cursor.description]
        instruction = [{columns[i]: row[i] for i in range(len(columns))} for row in results]

        # CLOSE DATABASE CONNECTION
        cursor.close()
        conn.close()

        return instruction
    except:
        raise



def get_assistant_from_listing_id(listing_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
                    SELECT assistant_id_OAI, assistant_description
                      FROM t_hbb_listing_assistant
                     WHERE listing_id = ?
                """
        # print('GET_ASSISTANT_FROM_LISTING_ID', query, listing_id)
        # print('DEBUG:', query, 'LISTING_ID', listing_id)
        cursor.execute(query, (listing_id,))
        assistant_data = cursor.fetchone()
        assistant = assistant_data[0]

        # CLOSE DATABASE CONNECTION
        cursor.close()
        conn.close()

        return assistant
    except:
        print('ERROR in get_assistant_from_listing_id, listing_id:', listing_id)
        raise


def get_questions_from_site_location(listing_id, site_location):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
            SELECT q.question as question_text
              FROM t_hbb_listing_site_map_question as q
              JOIN t_hbb_listing_flow_site_map as fsp
                ON fsp.site_map_id = q.site_map_id
              JOIN t_hbb_listing_flow as flow
                ON flow.flow_id = fsp.flow_id
             WHERE flow.listing_id = ?
               AND fsp.site_map_location COLLATE Latin1_General_CI_AS = ?

            """
    cursor.execute(query, (listing_id, site_location))
    question_data = cursor.fetchall()

    # Convert fetchall() result to list of dictionaries
    columns = [column[0] for column in cursor.description]
    questions = [{columns[i]: row[i] for i in range(len(columns))} for row in question_data]

    # CLOSE DATABASE CONNECTION
    cursor.close()
    conn.close()

    return questions



def get_carousel_name_prompt_for_listing_id(listing_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
                SELECT carousel_description, carousel_conversation_summary_prompt
                  FROM t_hbb_carousel
                 WHERE listing_id = ?
                 """
        cursor.execute(query, (listing_id,))
        carousel_data = cursor.fetchall()

        # Convert fetchall() result to list of dictionaries
        columns = [column[0] for column in cursor.description]
        carousel_dict = [{columns[i]: row[i] for i in range(len(columns))} for row in carousel_data]

        # CLOSE DATABASE CONNECTION
        cursor.close()
        conn.close()

        return carousel_dict
    except:
        raise




def create_qr_code(base_url, listing_id):
    # Data to be encoded
    data = f"{base_url}?listing_id={listing_id}"
    # print('DEBUG: QE CODE URL:', data)

    # Create qr code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    # Add data
    qr.add_data(data)
    qr.make(fit=True)

    # Create an image from the QR Code instance
    img = qr.make_image(fill='black', back_color='white')

    # Save the image to a BytesIO object
    buffered = BytesIO()
    img.save(buffered, "PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    # img_str = ''
    return img_str, data




def upsert_user_information_questions(listing_id, user_id, qa_string):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the record exists
        select_query = """
            SELECT question_answer_lists 
              FROM t_hbb_user_information_questions 
              WHERE userid = ? AND listing_id = ?
        """
        cursor.execute(select_query, (user_id, listing_id))
        result = cursor.fetchone()

        current_time = dt.datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")

        if result:
            # If record exists, update the chat log
            existing_qa_list = result[0]
            new_qa_list = f"{current_time}: {qa_string}"
            updated_qa_list = f"{existing_qa_list}\n{new_qa_list}"
            update_query = """
                UPDATE t_hbb_user_information_questions 
                   SET question_answer_lists = ? 
                 WHERE userid = ? 
                 AND listing_id = ?
            """
            cursor.execute(update_query, (updated_qa_list, user_id, listing_id))
        else:
            # If record does not exist, insert a new record
            new_qa_list = f"{current_time}: {qa_string}"
            insert_query = """
                INSERT INTO t_hbb_user_information_questions (userid, listing_id, question_answer_lists) 
                VALUES (?, ?, ?)"""
            cursor.execute(insert_query, (user_id, listing_id, new_qa_list))

        conn.commit()

        # Close the database connection
        cursor.close()
        conn.close()

        return 1
    except Exception as e:
        print(f"An error occurred: {e}")
        raise


def get_carousel_subdir(carousel_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the record exists
        select_query = """
            SELECT car.carousel_subdir 
              FROM t_hbb_carousel as car 
             WHERE car.listing_id = ?
               AND car.carousel_name = ?        
        """
        cursor.execute(select_query, (retrieve_session_variable('LISTING_ID'), carousel_name))
        result = cursor.fetchone()

        conn.commit()

        # Close the database connection
        cursor.close()
        conn.close()

        return result[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise


def get_balloon_questions_from_listing_id(listing_id, type='entry'):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
                SELECT q.question, q.answer_list as answers, q.question_order, q.required_answers as required_responses, q.thank_you_message
                  FROM t_hbb_balloongame_questions as q 
                  JOIN t_hbb_listing as l 
                    ON q.listing_id = l.listing_id
                 WHERE l.listing_id = ? AND q.question_type = ?
                 ORDER BY q.question_order
                """
        cursor.execute(query, (listing_id, type))
        results = cursor.fetchall()

        # Convert fetchall() result to list of dictionaries
        columns = [column[0] for column in cursor.description]
        instruction = [{columns[i]: row[i] for i in range(len(columns))} for row in results]

        # CLOSE DATABASE CONNECTION
        cursor.close()
        conn.close()

        return instruction
    except:
        raise




def check_auth(cursor, email, password):
    query = """
            SELECT userid, password_hash, admin, agent, user_type 
              FROM t_hbb_user 
             WHERE email = ?
            """
    cursor.execute(query, (email,))
    result = cursor.fetchone()
    if result and check_password_hash(result[1], password):
        return {
            'userid': result[0],
            'admin': result[2],
            'agent': result[3]
        }
    return None




def get_predetermined_response(system_prompt_text):
    try:
        # Get the listing_id from the session variable
        listing_id = retrieve_session_variable('LISTING_ID')

        # Return None if listing_id or system_prompt_text are missing
        if not listing_id or not system_prompt_text:
            return None

        # Database connection
        conn = get_db_connection()  # Assuming you have a function to get the DB connection
        cursor = conn.cursor()

        # SQL query to find matching responses
        sql = """
            SELECT response_text 
            FROM t_hbb_predetermined_responses
            WHERE listing_id = %s AND system_prompt_text = %s
        """

        # Execute the query
        cursor.execute(sql, (listing_id, system_prompt_text))
        results = cursor.fetchall()

        # If there are no results, return None
        if not results:
            return None

        # Select a random response from the results
        response = random.choice(results)[0]

        return response

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

    finally:
        cursor.close()
        conn.close()


# def write_log_to_db(question, system_prompt, question_source, answer, userID = None, action=None, action_source=None):
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         if userID is None:
#             userID = retrieve_session_variable('USER_ID')
#             if userID is None:
#                 userID = uuid.uuid4()
#
#         print('Writing to t_hbb_site_user_log with USERID', userID, retrieve_session_variable('USER_ID'))
#
#         cursor.execute('''
#             INSERT INTO t_hbb_site_user_log
#             (listing_id, user_id, question, system_prompt, question_source, answer, session_id, action, action_source)
#             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
#                        (retrieve_session_variable('LISTING_ID'), userID, question, system_prompt, question_source,
#                         answer, retrieve_session_variable('SESSION_ID'), action, action_source)
#                        )
#         conn.commit()
#         cursor.close()
#         conn.close()
#
#         return True
#     except Exception as e:
#         print(f"Error writing log to the database: {e}")
#         return False
import uuid

# def write_log_to_db(question, system_prompt, question_source, answer, userID=None, action=None, action_source=None):
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Retrieve or generate user_id
#         if userID is None:
#             userID = retrieve_session_variable('USER_ID')
#             if userID is None:
#                 userID = str(uuid.uuid4())  # Generate a new UUID string
#
#         # Retrieve listing_id and session_id
#         listing_id = retrieve_session_variable('LISTING_ID')
#         session_id = retrieve_session_variable('SESSION_ID')
#
#         print(f"[DEBUG] Writing to t_hbb_site_user_log with USER_ID: {userID}, LISTING_ID: {listing_id}, SESSION_ID: {session_id}")
#
#         # ✅ PostgreSQL INSERT statement with %s placeholders
#         cursor.execute('''
#             INSERT INTO t_hbb_site_user_log
#             (listing_id, user_id, question, system_prompt, question_source, answer, created_at, action, action_source)
#             VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)''',  # Use NOW() for timestamp
#             (listing_id, userID, question, system_prompt, question_source, answer, action, action_source)
#         )
#
#         conn.commit()
#         cursor.close()
#         conn.close()
#
#         return True
#     except Exception as e:
#         print(f"[ERROR] Error writing log to the database: {e}")
#         return False

def write_log_to_db(question, system_prompt, question_source, answer, userID=None, action=None, action_source=None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Retrieve session variables
        if userID is None:
            userID = retrieve_session_variable('USER_ID')  # Get user ID from session
        if not userID:
            userID = None  # Allow NULL if no userID is available

        listing_id = retrieve_session_variable('LISTING_ID')
        if not listing_id:
            raise ValueError("[ERROR] LISTING_ID cannot be NULL. Aborting log insertion.")

        print(f"[DEBUG] Writing to t_hbb_site_user_log with USER_ID: {userID}, LISTING_ID: {listing_id}, SESSION_ID: {retrieve_session_variable('SESSION_ID')}")

        cursor.execute('''
            INSERT INTO t_hbb_site_user_log 
            (listing_id, user_id, question, system_prompt, question_source, answer, created_at, action, action_source) 
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
        ''', (listing_id, userID, question, system_prompt, question_source, answer, action, action_source))

        conn.commit()
        cursor.close()
        conn.close()

        return True
    except Exception as e:
        print(f"[ERROR] Error writing log to the database: {e}")
        return False


# def get_active_listing_id(master_listing_id):
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Query to find the latest active listing_id for this master_listing_id
#         cursor.execute("""
#             SELECT listing_id
#             FROM t_hbb_master_listing
#             WHERE master_listing_id = ? AND active = 1
#         """, (master_listing_id,))
#
#         result = cursor.fetchone()
#
#         if result:
#             active_listing_id = result[0]
#             set_session_variable('LISTING_ID', active_listing_id.lower())
#             # print(f'Setting session LISTING_ID to: {active_listing_id}')
#             return active_listing_id  # Return the active listing_id if found
#         else:
#             print(f'No active listing found for master_listing_id: {master_listing_id}')
#             set_session_variable('LISTING_ID', None)
#             return None  # Return None if no active listing found
#
#     except Exception as e:
#         print(f"Error fetching listing_id for master_listing_id {master_listing_id}: {e}")
#         set_session_variable('LISTING_ID', None)  # Handle errors gracefully
#         return None  # Return None if there's an error
#
#     finally:
#         cursor.close()
#         conn.close()
def get_active_listing_id(master_listing_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to find the latest active listing_id for this master_listing_id
        cursor.execute("""
            SELECT listing_id 
            FROM t_hbb_master_listing 
            WHERE master_listing_id = %s AND active = TRUE
        """, (master_listing_id,))

        result = cursor.fetchone()

        if result:
            active_listing_id = result[0]
            if isinstance(active_listing_id, str):
                active_listing_id = active_listing_id.lower()  # Ensure lowercase if it's a string

            set_session_variable('LISTING_ID', active_listing_id)
            # print(f"[DEBUG] Active LISTING_ID found and set: {active_listing_id}")
            return active_listing_id  # Return the active listing_id if found
        else:
            print(f"[DEBUG] No active listing found for master_listing_id: {master_listing_id}")
            set_session_variable('LISTING_ID', None)
            return None  # Return None if no active listing found

    except Exception as e:
        print(f"[ERROR] Fetching listing_id for master_listing_id {master_listing_id}: {e}")
        set_session_variable('LISTING_ID', None)  # Handle errors gracefully
        return None  # Return None if there's an error

    finally:
        cursor.close()
        conn.close()


@app.route('/api/listing-details')
def api_listing_details():
    listing_id = retrieve_session_variable('LISTING_ID')
    # print('api_listing_details:', listing_id)

    # If listing ID is missing, return an empty result but keep 200 status code
    if listing_id is None:
        return jsonify({'listingDetails': None, 'listingID': None, 'message': 'No listing ID provided'}), 200

    # Proceed with fetching details if listing_id is available
    status_code = 'active'
    details = get_listing_details_2(listing_id)

    # Check if details are found for the given listing_id
    if not details:
        return jsonify({'listingDetails': None, 'listingID': listing_id, 'message': 'No details found'}), 200

    detail = details[0]
    # print('details', detail)
    return jsonify({'listingDetails': detail, 'listingID': listing_id}), 200


# uid_pattern = re.compile(r'^[a-f0-9]{32}$')
uuid_pattern = re.compile(r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$')


def is_valid_uid(uid):
    return bool(uid_pattern.match(uid))


# Define the function to send emails via Azure Communication Services
def send_email_via_acs(to_email, subject, content):
    """Send an email using Azure Communication Services."""

    # Retrieve Azure Communication Services connection string from environment variables
    ACS_CONNECTION_STRING = os.getenv('AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING')

    # Check if the ACS connection string is set
    if not ACS_CONNECTION_STRING:
        print("Azure Communication Services connection string is not set.")
        raise ValueError("Azure Communication Services connection string is not set.")

    # Initialize the EmailClient with the connection string
    email_client = EmailClient.from_connection_string(ACS_CONNECTION_STRING)

    # Create the email message structure
    message = {
        "content": {
            "subject": subject,  # Subject of the email
            "plainText": content,  # Plain text content of the email
            "html": f"<html><p>{content}</p></html>"  # HTML content (formatted version)
        },
        "recipients": {
            "to": [
                {"email": to_email, "displayName": "Recipient"}  # Recipient's email and display name
            ]
        },
        "senderAddress": "DoNotReply@c50ed25d-2da8-4d5e-9c8f-45b84894f545.azurecomm.net"
        # Make sure to replace this with a verified sender address in ACS
    }

    # Attempt to send the email and handle potential errors
    try:
        response = email_client.send(message)
        print(f"Email sent to {to_email}. Response code: {response}")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

# @app.route("/", defaults={"path": ""})
# @app.route("/<path:path>", strict_slashes=False)
# def serve(path=""):
#     try:
#         # Step 1: Log incoming requests
#         print(f"[DEBUG] serve(): MAIN: Query parameters: {request.args}")
#
#         mid = request.args.get("listing_id")
#         if mid:
#             print(f"[DEBUG] serve(): listing_id FOUND -> {mid}, checking for active listing_id")
#             lid = get_active_listing_id(mid)
#             if len(lid) > 0:
#                 print(f"[DEBUG] serve(): Saving Master Listing ID, Listing_id and ID_FROM_URL")
#                 set_session_variable('MASTER_LISTING_ID', mid)
#                 set_session_variable('LISTING_ID', lid)
#                 set_session_variable('ID_FROM_URL', True)
#             else:
#                 print(f"[DEBUG] serve(): Now Active Listing ID found")
#         else:
#             hold = 'hold'
#             print("[DEBUG] serve(): listing_id NOT FOUND in request")
#
#         # Step 2: Serve static files if they exist
#         file_path = safe_join(app.static_folder, path)
#         if path and os.path.exists(file_path):
#             # print(f"DEBUG: MAIN: Serving static file: {file_path}")
#             return send_from_directory(app.static_folder, path)
#
#         # Step 3: Fallback to React's index.html for unmatched paths
#         # print("DEBUG: MAIN: Path not found or empty. Serving index.html.")
#         return send_from_directory(app.static_folder, 'index.html')
#
#     except Exception as e:
#         # Catch unexpected errors
#         # print(f"DEBUG: Unexpected error: {e}")
#         return "An error occurred while processing your request.", 500

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>", strict_slashes=False)
def serve(path=""):
    try:
        # 🔹 Log incoming request
        print(f"[DEBUG] serve(): MAIN: Query parameters: {request.args}")

        # ✅ Check if 'listing_id' exists in the URL
        listing_id = request.args.get("listing_id")

        if listing_id:
            print(f"[DEBUG] serve(): listing_id FOUND -> {listing_id}, checking for active listing_id")

            # ✅ Find active listing ID in the database
            active_listing_id = get_active_listing_id(listing_id)

            if active_listing_id:
                print(f"[DEBUG] serve(): Saving Master Listing ID and Listing_id to session")

                # ✅ Store in session
                set_session_variable("MASTER_LISTING_ID", listing_id)
                set_session_variable("LISTING_ID", active_listing_id)
                set_session_variable("ID_FROM_URL", True)

                return redirect("/WelcomePage")  # ✅ Redirect user to WelcomePage
            else:
                print(f"[DEBUG] serve(): No Active Listing ID found")
        else:
            print("[DEBUG] serve(): No listing_id found in URL")

        # 🔹 Serve static files if they exist
        file_path = safe_join(app.static_folder, path)
        if path and os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)

        # 🔹 Serve React's index.html for unmatched paths
        return send_from_directory(app.static_folder, "index.html")

    except Exception as e:
        print(f"[ERROR] serve(): Unexpected error: {e}")
        return "An error occurred while processing your request.", 500


# Route to catch `/listings` subdirectory and serve React's index.html
@app.route("/listings")
def serve_listings():
    try:
        # print("DEBUG: Handling /listings route")

        # Step 1: Retrieve `master_listing_id` from query parameters
        master_listing_id = request.args.get('listing_id')
        # print(f"[DEBUG]: master_listing_id retrieved: {master_listing_id}")

        # Step 2: Initialize session variables if needed
        if 'ID_FROM_URL' not in session:
            # print("[DEBUG] serve_listings(): Initializing session variables for /listings")
            initialize_session_variables()

        # Step 3: Process the `master_listing_id`
        if master_listing_id:
            try:
                # print("[DEBUG] serve_listings(): Processing master_listing_id...")
                set_session_variable('SESSION_ID', uuid.uuid4())
                set_session_variable('ID_FROM_URL', True)
                set_session_variable('MASTER_LISTING_ID', master_listing_id)

                # Fetch active listing ID
                listing_id = get_active_listing_id(master_listing_id)
                if listing_id:
                    # print(f"[DEBUG] serve_listings(): Active listing_id found: {listing_id}")
                    set_session_variable('LISTING_ID', listing_id.lower())
                else:
                    # print(f"[DEBUG] serve_listings(): No active listing found for master_listing_id: {master_listing_id}")
                    set_session_variable('LISTING_ID', None)

            except Exception as e:
                # print(f"[DEBUG] serve_listings(): Error processing master_listing_id: {e}")
                set_session_variable('LISTING_ID', None)

        # Step 4: Log session variables
        # print(f"DEBUG: ID_FROM_URL: {retrieve_session_variable('ID_FROM_URL')}")
        # print(f"DEBUG: LISTING_ID: {retrieve_session_variable('LISTING_ID')}")

        # Step 5: Serve React's `index.html`
        # print("DEBUG: Serving React index.html for /listings")
        return send_from_directory(app.static_folder, "index.html")

    except Exception as e:
        print(f"ERROR: {e}")
        return "An error occurred while serving /listings", 500


@app.route('/api/login_new', methods=['POST'])
def login_new():
    # print('SIGNIN ANON')
    # return jsonify({"success": True, "message": "Anonymous user registered successfully", "user_id": '123'}), 201

    if no_com:
        return jsonify({"success": True, "message": "Anonymous user registered successfully", "user_id": '123'}), 201

    data = request.get_json()
    # print('DEBUG', data)
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')
    login_type = data.get('login_type')
    answers = data.get('answers')

    conn = get_db_connection()
    cursor = conn.cursor()

    user_id = None
    admin = False
    agent = False
    # Scenario 1: Anonymous User This too
    if login_type == 'anon':
        new_user_id = str(uuid.uuid4())
        query = """
                INSERT INTO t_hbb_user (userid, user_type) 
                VALUES (?, ?)
                """
        cursor.execute(query, (new_user_id, login_type))
        conn.commit()
        if answers:
            upsert_user_information_questions(listing_id=retrieve_session_variable('LISTING_ID'), user_id=new_user_id,
                                              qa_string=answers)
        set_session_variable('USER_ID', new_user_id)
        upsert_user_listing(listing_id=retrieve_session_variable('MASTER_LISTING_ID'), user_id=new_user_id)
        return jsonify(
            {"success": True, "message": "Anonymous user registered successfully", "user_id": new_user_id, "admin": 0,
             "agent": 0}), 201

    # Scenario 2 and 3: Known User
    if email and password:
        user_data = check_auth(cursor, email, password)
        if user_data:
            user_id = user_data['userid']
            admin = user_data['admin']
            agent = user_data['agent']
            user_type = user_data['user_type']
            set_session_variable('EMAIL', email)
            if user_type == 'super_admin':
                set_session_variable('SUPER_ADMIN', True)

            # if user_id:
            if answers:
                upsert_user_information_questions(listing_id=retrieve_session_variable('LISTING_ID'),
                                                  user_id=user_id,
                                                  qa_string=answers)
            set_session_variable('USER_ID', user_id)
            upsert_user_listing(listing_id=retrieve_session_variable('MASTER_LISTING_ID'), user_id=user_id)
            return jsonify({"success": True, "message": "Login successful", "user_id": user_id, "admin": admin,
                            "agent": agent}), 200
        else:
            # Scenario 3: Registration of a new user
            new_user_id = str(uuid.uuid4())
            password_hash = generate_password_hash(password)
            query = """
                    INSERT INTO t_hbb_user (userid, first_name, last_name, email, password_hash, phone, user_type) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """
            cursor.execute(query, (new_user_id, first_name, last_name, email, password_hash, phone, login_type))
            conn.commit()
            if answers:
                upsert_user_information_questions(listing_id=retrieve_session_variable('LISTING_ID'),
                                                  user_id=new_user_id,
                                                  qa_string=answers)
            set_session_variable('USER_ID', new_user_id)
            upsert_user_listing(listing_id=retrieve_session_variable('MASTER_LISTING_ID'), user_id=user_id)
            return jsonify(
                {"success": True, "message": "User registered successfully", "userid": new_user_id, "admin": 0,
                 "agent": 0}), 201

    return jsonify({"success": False, "message": "Email and password required for known users"}), 400



# @app.route('/api/check-login', methods=['GET'])
# def check_login():
#     try:
#         # Establish a database connection
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Retrieve the user_id from the session
#         user_id = retrieve_session_variable('USER_ID')
#         # print('CHECK-LOGIN DEBUG: USER_ID', user_id)
#
#         if user_id is None:
#             response = {
#                 "isLoggedIn": False,
#                 "isAdmin": False,
#                 "isAgent": False,
#                 "user_id": None,
#                 "first_name": None,
#                 "last_name": None,
#                 "email": None
#             }
#             return jsonify(response), 200
#
#         # SQL query to get the user information based on user_id
#         sql = """
#         SELECT
#             userid,
#             first_name,
#             last_name,
#             email,
#             admin,
#             agent
#         FROM
#             t_hbb_user
#         WHERE
#                 userid = ?
#         """
#
#         # Execute the SQL query with the user_id parameter
#         cursor.execute(sql, (user_id,))
#         user = cursor.fetchone()
#
#         if user is None:
#             response = {
#                 "isLoggedIn": False,
#                 "isAdmin": False,
#                 "isAgent": False,
#                 "user_id": None,
#                 "first_name": None,
#                 "last_name": None,
#                 "email": None
#             }
#             return jsonify(response), 200
#
#         # Extract fields from the query result
#         columns = [column[0] for column in cursor.description]
#         user_data = dict(zip(columns, user))
#
#         # Build the response based on user data
#         response = {
#             "isLoggedIn": True,
#             "isAdmin": user_data.get('admin') == 1,
#             "isAgent": user_data.get('agent') == 1,
#             "user_id": user_data.get('userid'),
#             "first_name": user_data.get('first_name'),
#             "last_name": user_data.get('last_name'),
#             "email": user_data.get('email')
#         }
#
#         return jsonify(response), 200
#
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         cursor.close()
#         conn.close()
@app.route('/api/check-login', methods=['GET'])
def check_login():
    try:
        print("🔥 [DEBUG] check-login: API called")  # Confirm function call

        # Check if USER_ID exists in the session before trying to retrieve it
        if 'USER_ID' not in session:
            print("⚠️ [DEBUG] USER_ID not found in session")
            return jsonify({
                "isLoggedIn": False,
                "isAdmin": False,
                "isAgent": False,
                "user_id": None,
                "first_name": None,
                "last_name": None,
                "email": None
            }), 200  # Gracefully return a valid JSON response

        # Retrieve USER_ID if it exists
        user_id = retrieve_session_variable('USER_ID')
        print(f"🔍 [DEBUG] Retrieved USER_ID: {user_id}")

        if not user_id:
            return jsonify({
                "isLoggedIn": False,
                "isAdmin": False,
                "isAgent": False,
                "user_id": None,
                "first_name": None,
                "last_name": None,
                "email": None
            }), 200

        # ✅ Fetch user info from the database
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
        SELECT userid, first_name, last_name, email, admin, agent
        FROM t_hbb_user
        WHERE userid = %s
        """
        cursor.execute(sql, (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({
                "isLoggedIn": False,
                "isAdmin": False,
                "isAgent": False,
                "user_id": None,
                "first_name": None,
                "last_name": None,
                "email": None
            }), 200

        # Extract user data
        columns = [column[0] for column in cursor.description]
        user_data = dict(zip(columns, user))

        # ✅ Properly format the response
        response = {
            "isLoggedIn": True,
            "isAdmin": bool(user_data.get('admin')),
            "isAgent": bool(user_data.get('agent')),
            "user_id": user_data.get('userid'),
            "first_name": user_data.get('first_name'),
            "last_name": user_data.get('last_name'),
            "email": user_data.get('email')
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"❌ [ERROR] check_login: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/logout', methods=['POST'])
def logout():
    initialize_session_variables()

    session.pop('THREAD_ID', None)

    return jsonify({'success': True}), 200



@app.route('/api/ask_stream', methods=["GET", "POST"])
def ask_stream():
    set_session_variable('QUESTION_COUNT', retrieve_session_variable('QUESTION_COUNT') + 1)

    # Extract data from request
    data = request.get_json()
    user_question = data['user_question']
    prompt = data['system_prompt']
    question_origin = data['question_origin']
    system_prompt = prompt
    question_id = data['question_id']
    assistant_id = data['assistant_id']
    listing_id = data['listing_id'].lower()

    print('SYSTEM PROMPT', system_prompt)

    formatted_date = None
    # lid = retrieve_session_variable('LISTING_ID')
    lid = listing_id

    print('GETTING ASSISTANT ID', lid)
    # print('GOT ASSISTANT ID', assistant_id)
    if not assistant_id:
        print('Getting Assistant ID from DATABASE')
        assistant_id = get_assistant_from_listing_id(lid)
        if not assistant_id:
            return jsonify({'error': 'No Assistant ID Associated with this listing'}), 400

    if not prompt:
        return jsonify({'error': 'No question provided'}), 400

    message_queue = queue.Queue()

    if not retrieve_session_variable('OAI_THREAD_ID'):
        # Create a thread (if none exists)
        thread = client.beta.threads.create()
        thread_id = thread.id
        set_session_variable('OAI_THREAD_ID', thread_id)
    else:
        thread_id = retrieve_session_variable('OAI_THREAD_ID')

    # Create a new message in the thread
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=prompt,
    )

    def generate():
        if formatted_date:
            buffer = formatted_date + ' '
        else:
            buffer = ""

        # NEEDED TO TRAP JSON
        entire_response = buffer
        is_json = False  # Flag to track JSON sections
        wait_for_json = False  # Flag to track JSON sections
        extracted_json = None

        entire_response = ""  # Collect the entire response

        # Check if the question starts with "COMPU" and get the canned response
        canned_response = get_predetermined_response(system_prompt)

        if canned_response:
            # Simulate streaming by breaking the response into chunks of 1-3 words
            response_words = canned_response.split(' ')
            i = 0
            while i < len(response_words):
                # Randomly select chunk size (1 to 3 words)
                chunk_size = random.randint(1, 3)
                chunk = ' '.join(response_words[i:i + chunk_size])
                i += chunk_size

                # Simulate a random delay between 0.1 and 0.5 seconds
                time.sleep(random.uniform(0.05, 0.3))

                # Print and yield each chunk to simulate streaming
                # print('PREDETERMINED CHUNK:', chunk)

                yield chunk + ' '  # Add a space to maintain the natural flow
                entire_response += chunk + ' '

            # Since we are using a predetermined response, we can skip the AI chatbot interaction
            # return
        else:
            # If no canned response is used, proceed with the normal chatbot interaction
            event_handler = EventHandler(message_queue)
            # print('ASKING QUESTION WITH ASSISTANT ID', assistant_id)
            with client.beta.threads.runs.stream(
                    thread_id=thread_id,
                    assistant_id=assistant_id,
                    event_handler=event_handler,
            ) as stream:
                try:
                    # Stream the AI-generated content
                    for st in stream:
                        if not message_queue.empty():
                            message = message_queue.get_nowait()
                            buffer += message
                            entire_response += message




                            # Normal streaming
                            is_json = False
                            if not is_json:
                                print('buffer', buffer)
                                yield buffer
                                buffer = ""  # Clear buffer after streaming

                except Exception as e:
                    print(f"Error occurred: {e}")
                    raise
                finally:
                    if entire_response:
                        print('ENTIRE RESPONSE:', entire_response)
                    stream.until_done()


    # Save final session data outside the generator
    # response = Response(stream_with_context(generate()), content_type='text/event-stream')

        # print('ENTIRE RESPONSE', entire_response)
        # if "```json" in entire_response or "``` json" in entire_response:
        #     print('Found JSON start')
        #     tmp = entire_response.split("```json", 1) if "```json" in entire_response else entire_response.split("``` json", 1)
        #     json = tmp[1]
        #     if "```" in  json:
        #         tmp = json.split("```")
        #         json = tmp[0]
        #         print('EXTRACTED JSON BEING SAVED TO SESSION', json)
        #         set_session_variable('RESPONSE_JSON', json)
        #         print("retrieve_session_variable('RESPONSE_JSON')", retrieve_session_variable('RESPONSE_JSON'))
        #         session.modified = True

        # SAVE CHAT TO DATABASE
        # if question_id.upper() != 'OPENMODAL':
        #     # SAVE TO NEW WINDOW
        #     write_log_to_db(user_question,
        #                     system_prompt,
        #                     'chat',
        #                     entire_response)

    # return response
    return Response(stream_with_context(generate()), content_type='text/event-stream')



@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    data = request.json
    base_url = data['base_url']
    listing_id = data['listing_id'].lower()
    qr_code, qr_url = create_qr_code(base_url, listing_id)
    return jsonify({'qr_code': qr_code, 'url': qr_url})




@app.route('/api/get_primary_system_prompt', methods=['GET'])
def retrieve_primary_system_prompt():
    try:
        # Get the listing_id from the session variable
        listing_id = retrieve_session_variable('LISTING_ID')

        if not listing_id:
            return jsonify({'error': 'listing_id not found in session'}), 400

        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # SQL query to find the system response where image_order is minimum
        sql = """
        SELECT TOP 1 image_click_system_prompt
        FROM t_hbb_site_carousel
        WHERE listing_id = ?
        ORDER BY image_order ASC
        """

        # Execute the query
        cursor.execute(sql, (listing_id,))
        result = cursor.fetchone()

        # If there is no result, return an error
        if not result:
            return jsonify({'error': 'No system prompt found for the given listing_id'}), 404

        # Extract the system prompt from the result
        system_prompt = result[0]

        return jsonify({'system_prompt': system_prompt})

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'Internal server error'}), 500

    finally:
        cursor.close()
        conn.close()


@app.route('/api/get_convotop_questions', methods=['GET'])
def get_convotop_questions():
    try:
        listing_id = retrieve_session_variable('LISTING_ID')
        convotop = request.args.get('CONVOTOP')

        if not listing_id or not convotop:
            return jsonify({'error': 'listing_id and CONVOTOP are required'}), 400

        # Database connection
        conn = get_db_connection()

        query = '''
            SELECT question_id, quick_question, quick_question_system_prompt, qucik_question_order
            FROM t_hbb_site_convotop_questions
            WHERE listing_id = ? AND CONVOTOP = ?
            ORDER BY qucik_question_order ASC
        '''

        cursor = conn.cursor()
        cursor.execute(query, (listing_id, convotop))
        questions = cursor.fetchall()

        if not questions:
            return jsonify([]), 200

        result = [
            {
                'question_id': str(row.question_id),
                'quick_question': row.quick_question,
                'quick_question_system_prompt': row.quick_question_system_prompt,
                'qucik_question_order': row.qucik_question_order
            }
            for row in questions
        ]

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/get_site_location_questions', methods=['GET'])
def get_site_location_questions():
    try:
        listing_id = retrieve_session_variable('LISTING_ID')
        site_location = request.args.get('SITE_LOCATION')

        if not listing_id or not site_location:
            return jsonify([]), 200  # Return an empty list instead of an error if missing

        # Database connection
        conn = get_db_connection()

        query = '''
            SELECT question_id, quick_question, quick_question_system_prompt, qucik_question_order
            FROM t_hbb_site_location_questions
            WHERE listing_id = ? AND SITE_LOCATION = ?
            ORDER BY qucik_question_order ASC
        '''

        cursor = conn.cursor()
        cursor.execute(query, (listing_id, site_location))
        questions = cursor.fetchall()

        if not questions:
            return jsonify([]), 200

        result = [
            {
                'question_id': str(row.question_id),
                'quick_question': row.quick_question,
                'quick_question_system_prompt': row.quick_question_system_prompt,
                'qucik_question_order': row.qucik_question_order
            }
            for row in questions
        ]

        # print('RESULT', result)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Function to write the log to the database

# Flask route to log user interaction
@app.route('/api/log-user-interaction', methods=['POST'])
def log_user_interaction():
    # print('SAVING LOG')

    # Collecting parameters from request and session variables
    data = request.json
    question = data.get('question')
    system_prompt = data.get('system_prompt')
    question_source = data.get('question_source')
    action = data.get('action')
    action_source = data.get('action_source')
    answer = data.get('answer')
    userID = data.get('userID')


    # Call the write_log_to_db function with collected parameters
    if write_log_to_db(question=question, system_prompt=system_prompt, question_source=question_source, answer=answer, userID=userID, action=action, action_source=action_source):
        return jsonify({'message': 'User interaction logged successfully'}), 200
    else:
        return jsonify({'message': 'Error logging interaction'}), 500


@app.route('/api/get_binQGame_images_questions', methods=['GET'])
def get_bin_q_image_game_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # SQL query to select all images and their associated questions for a given listing_id
        sql = """
        SELECT 
            img.listing_id,
            img.image_id,
            img.image_file,
            img.image_description,
            img.image_user_prompt,
            img.image_system_prompt,
            img.location_id,
            img.image_order,
            q.question_id,
            q.question,
            q.question_type,
            q.question_order
        FROM 
            t_hbb_BinQImageGame_images AS img
        LEFT JOIN 
            t_hbb_BinQImageGame_questions AS q
            ON img.image_id = q.image_id
        WHERE 
            LOWER(img.listing_id) = LOWER(?)
        ORDER BY 
            img.image_order, q.question_order;
        """

        # Execute the SQL query
        cursor.execute(sql, (retrieve_session_variable('LISTING_ID'),))
        results = cursor.fetchall()

        # Fetching column names to construct the response
        columns = [column[0] for column in cursor.description]

        # Organize data into the required format
        image_game_data = {}
        for row in results:
            # Create a dictionary for each image if not already created
            image_id = row[columns.index('image_id')]
            if image_id not in image_game_data:
                image_game_data[image_id] = {
                    'listing_id': row[columns.index('listing_id')],
                    'image_id': image_id,
                    'image_file': row[columns.index('image_file')],
                    'image_description': row[columns.index('image_description')],
                    'image_user_prompt': row[columns.index('image_user_prompt')],
                    'image_system_prompt': row[columns.index('image_system_prompt')],
                    'image_order': row[columns.index('image_order')],
                    'location_id': row[columns.index('location_id')],
                    'questions': []
                }

            # If a question exists, add it to the 'questions' array
            question_id = row[columns.index('question_id')]
            if question_id:
                question_data = {
                    'question_id': question_id,
                    'question': row[columns.index('question')],
                    'question_type': row[columns.index('question_type')],
                    'question_order': row[columns.index('question_order')]
                }
                image_game_data[image_id]['questions'].append(question_data)

        # Convert the dictionary to a list and return as JSON
        image_game_list = list(image_game_data.values())

        return jsonify(image_game_list)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred while fetching image game data"}), 500
        # return image_game_list
    finally:
        cursor.close()
        conn.close()


@app.route('/api/get_binimageqgame_answer_percentages', methods=['GET'])
def get_binimageqgame_answer_percentages():
    # print('GET_BINIMAGEGAME_PERCENTAGES 1')
    try:
        # Retrieve listing_id from session and question_source from query parameters
        listing_id = retrieve_session_variable('LISTING_ID')
        question_source = 'binimageqgame'
        # print('GET_BINIMAGEGAME_PERCENTAGES 2')

        if not listing_id or not question_source:
            print('ERROR: LISTING_ID NOT FOUND')
            return jsonify({'error': 'listing_id and question_source are required'}), 400

        # Database connection
        conn = get_db_connection()

        # Modified SQL query to handle division by zero
        query = '''
            WITH AnswerCounts AS (
                SELECT
                    COUNT(CASE WHEN answer = 'up' THEN 1 END) AS up_count,
                    COUNT(CASE WHEN answer = 'down' THEN 1 END) AS down_count,
                    COUNT(*) AS total_count
                FROM t_hbb_site_user_log
                WHERE listing_id = ? AND question_source = ?
            )
            SELECT
                CASE 
                    WHEN total_count = 0 THEN 0 
                    ELSE (CAST(up_count AS FLOAT) / total_count) * 10 
                END AS up_scaled,
                CASE 
                    WHEN total_count = 0 THEN 0 
                    ELSE (CAST(down_count AS FLOAT) / total_count) * 10 
                END AS down_scaled
            FROM AnswerCounts;
        '''

        # print('GET_BINIMAGEGAME_PERCENTAGES 3')
        cursor = conn.cursor()
        cursor.execute(query, (listing_id.lower(), question_source))
        result = cursor.fetchone()
        # print('FETCH ANSWER PERCENTAGES', result)
        # print('GET_BINIMAGEGAME_PERCENTAGES 4', result)

        # If no result is found
        if not result:
            print('ERROR: NO DATA FOUND')
            return jsonify({'error': 'No data found'}), 404
        # print('GET_BINIMAGEGAME_PERCENTAGES 5')

        # Extract the result and return it
        response = {
            'up_scaled': result.up_scaled if result.up_scaled is not None else 0,
            'down_scaled': result.down_scaled if result.down_scaled is not None else 0
        }
        # print('GET_BINIMAGEGAME_PERCENTAGES 6', response)
        return jsonify(response), 200

    except Exception as e:
        print('GET_BINIMAGEGAME_PERCENTAGES E', e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/get_imagebubblegame_images_questions', methods=['GET'])
def get_image_bubble_game_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # SQL query to select all images and their associated questions for a given listing_id
        image_sql = """
        SELECT 
            img.listing_id,
            img.image_id,
            img.image_file,
            img.image_description,
            img.image_user_prompt,
            img.image_system_prompt,
            img.location_id,
            img.image_order,
            q.question_id,
            q.question,
            q.question_type,
            q.question_order
        FROM 
            t_hbb_ImageBubbleGame_images AS img
        LEFT JOIN 
            t_hbb_ImageBubbleGame_questions AS q
            ON img.image_id = q.image_id
        WHERE 
            LOWER(img.listing_id) = ?
        ORDER BY 
            img.image_order, q.question_order;
        """

        # Execute the SQL query to get images and questions
        cursor.execute(image_sql, (retrieve_session_variable('LISTING_ID'),))
        results = cursor.fetchall()

        # Fetching column names to construct the response
        columns = [column[0] for column in cursor.description]

        # Organize data into the required format
        image_game_data = {}
        for row in results:
            image_id = row[columns.index('image_id')]
            if image_id not in image_game_data:
                image_game_data[image_id] = {
                    'listing_id': row[columns.index('listing_id')],
                    'image_id': image_id,
                    'image_file': row[columns.index('image_file')],
                    'image_description': row[columns.index('image_description')],
                    'image_user_prompt': row[columns.index('image_user_prompt')],
                    'image_system_prompt': row[columns.index('image_system_prompt')],
                    'image_order': row[columns.index('image_order')],
                    'location_id': row[columns.index('location_id')],
                    'questions': []
                }

            # If a question exists, add it to the 'questions' array
            question_id = row[columns.index('question_id')]
            if question_id:
                question_data = {
                    'question_id': question_id,
                    'question': row[columns.index('question')],
                    'question_type': row[columns.index('question_type')],
                    'question_order': row[columns.index('question_order')]
                }
                image_game_data[image_id]['questions'].append(question_data)

        # Query to get selection frequency for each answer
        frequency_sql = """
            WITH QuestionAnswers AS (
                SELECT 
                    i.image_id,              
                    q.question_id,
                    q.question,
                    ul.answer,
                    COUNT(ul.answer) AS answer_frequency,
                    MAX(ul.created_at) AS created_at
                FROM 
                    t_hbb_ImageBubbleGame_images i
                JOIN 
                    t_hbb_ImageBubbleGame_questions q
                    ON i.image_id = q.image_id
                JOIN 
                    t_hbb_site_user_log ul
                    ON i.listing_id = ul.listing_id  -- Correct this part to use ul.listing_id
                    AND q.question = ul.answer  -- Ensure this is correct: the question and answer must match
                WHERE 
                    LOWER(i.listing_id) = LOWER(?)
                    AND ul.question_source = 'imagebubblegame'
                GROUP BY 
                    i.image_id, q.question_id, q.question, ul.answer
            )
            SELECT 
                image_id,               
                question_id,
                question,
                answer,
                answer_frequency,
                created_at
            FROM 
                QuestionAnswers
            ORDER BY 
                image_id, created_at        
        """
        # Execute the SQL query for selection frequencies
        cursor.execute(frequency_sql, (retrieve_session_variable('LISTING_ID'),))
        freq_results = cursor.fetchall()

        # Fetching column names to construct the response
        req_columns = [column[0] for column in cursor.description]

        frequency_data = {}
        for row in freq_results:
            image_id = row[req_columns.index('image_id')]
            question_id = row[req_columns.index('question_id')]
            answer = row[req_columns.index('answer')]
            answer_frequency = row[req_columns.index('answer_frequency')]

            # Organize frequency data
            if image_id not in frequency_data:
                frequency_data[image_id] = {}
            if question_id not in frequency_data[image_id]:
                frequency_data[image_id][question_id] = []

            frequency_data[image_id][question_id].append({
                'answer': answer,
                'frequency': answer_frequency
            })

        # Integrate frequency data into the image game data
        for image_id, image_data in image_game_data.items():
            for question in image_data['questions']:
                question_id = question['question_id']
                if image_id in frequency_data and question_id in frequency_data[image_id]:
                    question['answer_frequencies'] = frequency_data[image_id][question_id]
                else:
                    question['answer_frequencies'] = []  # Default if no frequency data

        # Return the final response
        image_game_list = list(image_game_data.values())
        return jsonify(image_game_list)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred while fetching image game data"}), 500
    finally:
        cursor.close()
        conn.close()

# app = Flask(__name__)

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    import os
    import psycopg2
    from dotenv import load_dotenv

    load_dotenv()

    try:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        # print("[DEBUG] Database connection successful")
        return conn
    except Exception as e:
        print("[ERROR] Database connection failed:", e)
        return None

@app.route('/api/sitesignup', methods=['POST'])
def site_signup():
    try:
        # Log incoming request data
        data = request.get_json()

        # Extract user details
        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        phone = data.get('phone')
        password = data.get('password')
        anon = True if data.get('anon') in [1, '1', True, 'true'] else False
        represented_by_agent = True if data.get('represented_by_agent') == 'yes' else False

        # Check for required fields
        if not all([email, first_name, password]):
            return jsonify({"message": "Missing required fields"}), 400

        # Establish a database connection
        conn = get_db_connection()
        if not conn:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = conn.cursor()
        # print("[DEBUG] Database connection established")

        # Check if the user already exists
        query_check_user = "SELECT * FROM t_hbb_user WHERE email = %s"
        cursor.execute(query_check_user, (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            print("[ERROR] User already exists")
            return jsonify({"message": "User already exists"}), 400

        # Hash the password
        password_hash = generate_password_hash(password)
        user_id = str(uuid.uuid4())  # Generate a unique user ID

        # Insert the new user
        query_insert_user = '''
            INSERT INTO t_hbb_user (
                userid, first_name, last_name, email, phone, password_hash, admin, agent, represented_by_agent, anon
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        '''
        values = (user_id, first_name, last_name, email, phone, password_hash, False, False, represented_by_agent, anon)

        cursor.execute(query_insert_user, values)
        conn.commit()
        # print("[DEBUG] User inserted successfully")

        # Close connection
        cursor.close()
        conn.close()

        # Return success response
        return jsonify({"message": "User registered successfully!", "user_id": user_id}), 200

    except Exception as e:
        print("[ERROR] Exception occurred during signup:", e)
        traceback.print_exc()  # Print full error traceback for debugging
        return jsonify({'error': str(e)}), 500


@app.route('/api/sitelogin', methods=['POST'])
def site_login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        # print('[DEBUG]: In  Login')

        if not all([email, password]):
            return jsonify({"message": "Missing email or password"}), 400

        # Establish a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to retrieve the user based on the email
        query_user = ("SELECT userid, first_name, password_hash, represented_by_agent, admin "
                      "FROM t_hbb_user "
                      "WHERE email = %s")
        cursor.execute(query_user, (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "Invalid credentials"}), 401

        # Verify password
        user_id, first_name, stored_password_hash, represented_by_agent, admin = user

        if not check_password_hash(stored_password_hash, password):
            return jsonify({"message": "Invalid credentials"}), 401

        # SET SESSION ID
        set_session_variable('USER_ID', user_id)
        # print('USER ID SET', user_id)

        # If successful, return user information
        return jsonify({
            "message": "Login successful",
            "user_id": user_id,
            "first_name": first_name,
            "represented_by_agent": represented_by_agent,
            "admin": bool(admin)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/siteforgotpassword', methods=['POST'])
def site_forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            print("Email is required")
            return jsonify({"message": "Email is required"}), 400

        # Establish a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the user exists
        query_user = "SELECT userid FROM t_hbb_user WHERE email = ?"
        cursor.execute(query_user, (email,))
        user = cursor.fetchone()

        if not user:
            print("No user found with this email")
            return jsonify({"message": "No user found with this email"}), 404

        user_id = user.userid
        reset_token = str(uuid.uuid4())

        # Store the reset token
        # print("Updating User Token")
        query_update_token = "UPDATE t_hbb_user SET reset_token = ? WHERE userid = ?"
        cursor.execute(query_update_token, (reset_token, user_id))
        conn.commit()

        # Send the password reset email using ACS
        reset_url = f"http://yourdomain.com/resetpassword/{reset_token}"
        # print("Calling Send Email")
        send_email_via_acs(email, "Password Reset", f"Click here to reset your password: {reset_url}")

        return jsonify({"message": "Password reset link sent"}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# @app.route('/api/get_user_listings', methods=['GET'])
# def get_user_listings():
#     try:
#         # Establish a database connection
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Retrieve the user_id from the session (set during login)
#         user_id = retrieve_session_variable('USER_ID')
#         print('DEBUG: get_user_listings USER_ID', user_id)
#         if user_id is None:
#             grouped_listings = {
#                 'view': [],
#                 'admin': []
#             }
#             return jsonify(grouped_listings), 200
#
#         sql = """
#             SELECT DISTINCT
#                    ml.listing_id,
#                    ul.rights,
#                    l.created_at,
#                    dtl.listing_description,
#                    dtl.listing_address,
#                    dtl.listing_agent_id,
#                    dtl.listing_assistant_name,
#                    dtl.listing_image_id,
#                    ml.master_listing_id
#             FROM
#                 t_hbb_user_listing3 ul
#             LEFT JOIN
#                 t_hbb_master_listing ml ON ul.master_listing_id = ml.master_listing_id
#             LEFT JOIN
#                 t_hbb_listing l ON ml.listing_id = l.listing_id
#             LEFT JOIN
#                 t_hbb_listing_detail dtl ON dtl.listing_id = l.listing_id
#             WHERE
#                 ul.user_id = %s  -- 🔴 FIXED: Replaced `?` with `%s`
#                 AND ul.status = 'active'
#                 AND ml.active = 1
#             ORDER BY
#                 ul.rights DESC, l.created_at;
#         """
#
#         cursor.execute(sql, (user_id,))  # ✅ Corrected parameter usage
#
#         results = cursor.fetchall()
#
#         # Fetching column names to construct the response
#         columns = [column[0] for column in cursor.description]
#
#         # Convert results to a dictionary format
#         listings = [dict(zip(columns, row)) for row in results]
#
#         # Group listings by rights (viewable listings)
#         view_listings = [listing for listing in listings]
#
#         # Admin listings: find all listings associated with the same master_listing_id
#         admin_listings = []
#         for listing in listings:
#             if listing['rights'] == 'admin':
#                 master_listing_id = listing.get('master_listing_id')
#
#                 # Query to find all listing_ids associated with the same master_listing_id
#                 if master_listing_id:
#                     # print('MASTER LISTING ID', master_listing_id)
#                     cursor.execute("""
#                         SELECT l.listing_id,
#                                ld.listing_address,
#                                ml.master_listing_id,
#                                l.created_at,
#                                COALESCE(ml.active, 0) AS active
#                         FROM t_hbb_master_listing ml
#                         JOIN t_hbb_listing l ON ml.listing_id = l.listing_id
#                         JOIN t_hbb_listing_detail ld ON ld.listing_id = l.listing_id
#                         WHERE ml.master_listing_id = ?
#                         ORDER BY l.created_at;
#                     """, (master_listing_id,))
#                     related_listings = cursor.fetchall()
#
#                     for related_listing in related_listings:
#                         related_listing_id, related_listing_address, related_master_id, created_at, active_flag = related_listing
#                         # Add the related listings to the admin list
#                         admin_listings.append({
#                             "listing_id": related_listing_id,
#                             "listing_address": related_listing_address,
#                             "master_listing_id": related_master_id,
#                             "created_at": created_at,
#                             "active": active_flag
#                         })
#
#         # Ensure no duplicate listing_ids in the admin list
#         admin_listings = [dict(t) for t in {tuple(d.items()) for d in admin_listings}]
#
#         # Combine the listings for view and admin rights
#         grouped_listings = {
#             'view': view_listings,
#             'admin': admin_listings
#         }
#         # print('grouped_listings', grouped_listings)
#
#         # Query to fetch just the json_id, listing_id, and created_at from t_hbb_listing_json
#         sql_versions = """
#         SELECT json_id, listing_id, created_at
#         FROM t_hbb_listing_json
#         WHERE user_id = ?
#         AND json_id IS NOT NULL
#         AND listing_id IS NOT NULL
#         AND user_id IS NOT NULL
#         AND active = 1
#         ORDER BY created_at;
#         """
#         # Execute the SQL query for listing versions (json_ids only)
#         cursor.execute(sql_versions, (user_id.lower(),))
#         versions_results = cursor.fetchall()
#
#         # Extract json_ids into a dictionary grouped by listing_id
#         versions = {}
#         for version in versions_results:
#             json_id, listing_id, created_at = version
#             if listing_id in versions:
#                 versions[listing_id].append({"json_id": json_id, "listing_id": listing_id, "created_at": created_at})
#             else:
#                 versions[listing_id] = [{"json_id": json_id, "listing_id": listing_id, "created_at": created_at}]
#         print('versions', versions)
#
#         # Return both listings and versions separately
#         return jsonify({
#             "listings": grouped_listings,
#             "versions": versions  # Contains only the json_id and created_at
#         }), 200
#
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         cursor.close()
#         conn.close()
@app.route('/api/get_user_listings', methods=['GET'])
def get_user_listings():
    try:
        # Step 1: Establish a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Step 2: Retrieve the user_id from the session (set during login)
        user_id = retrieve_session_variable('USER_ID')
        print(f"[DEBUG]: get_user_listings USER_ID -> {user_id}")

        if user_id is None:
            print("[DEBUG]: No user_id found in session. Returning empty listings.")
            grouped_listings = {
                'view': [],
                'admin': []
            }
            return jsonify(grouped_listings), 200

        # Step 3: Fetch Listings Associated with User
        sql = """
            SELECT DISTINCT
                   ml.listing_id,
                   ul.rights,
                   l.created_at,
                   dtl.listing_description,
                   dtl.listing_address,
                   dtl.listing_agent_id,
                   dtl.listing_assistant_name,
                   dtl.listing_image_id,
                   ml.master_listing_id
            FROM 
                t_hbb_user_listing3 ul
            LEFT JOIN 
                t_hbb_master_listing ml ON ul.master_listing_id = ml.master_listing_id
            LEFT JOIN 
                t_hbb_listing l ON ml.listing_id = l.listing_id
            LEFT JOIN
                t_hbb_listing_detail dtl ON dtl.listing_id = l.listing_id
            WHERE 
                ul.user_id = %s
                AND ul.status = 'active'
                AND ml.active = TRUE
            ORDER BY 
                ul.rights DESC, l.created_at;
        """
        print(f"[DEBUG]: Executing SQL Query for Listings:\n{sql}")
        # print(f"DEBUG: SQL Parameters: {user_id}")

        cursor.execute(sql, (user_id,))
        results = cursor.fetchall()
        print(f"[DEBUG]: Retrieved {len(results)} listings.")

        # Step 4: Fetch column names
        columns = [column[0] for column in cursor.description]
        listings = [dict(zip(columns, row)) for row in results]

        # Step 5: Group Listings
        view_listings = [listing for listing in listings]
        # print(f"DEBUG: view_listings -> {view_listings}")

        # Step 6: Fetch Admin Listings
        admin_listings = []
        for listing in listings:
            if listing['rights'] == 'admin':
                master_listing_id = listing.get('master_listing_id')

                if master_listing_id:
                    admin_query = """
                        SELECT l.listing_id, 
                               ld.listing_address,
                               ml.master_listing_id, 
                               l.created_at, 
                               COALESCE(ml.active, FALSE) AS active
                        FROM t_hbb_master_listing ml
                        JOIN t_hbb_listing l ON ml.listing_id = l.listing_id
                        JOIN t_hbb_listing_detail ld ON ld.listing_id = l.listing_id
                        WHERE ml.master_listing_id = %s
                        ORDER BY l.created_at;
                    """
                    # print(f"DEBUG: Fetching admin listings for master_listing_id: {master_listing_id}")
                    cursor.execute(admin_query, (master_listing_id,))
                    related_listings = cursor.fetchall()

                    for related_listing in related_listings:
                        related_listing_id, related_listing_address, related_master_id, created_at, active_flag = related_listing
                        admin_listings.append({
                            "listing_id": related_listing_id,
                            "listing_address": related_listing_address,
                            "master_listing_id": related_master_id,
                            "created_at": created_at,
                            "active": active_flag
                        })

        # Remove duplicate admin listings
        admin_listings = [dict(t) for t in {tuple(d.items()) for d in admin_listings}]
        # print(f"DEBUG: Admin Listings: {admin_listings}")

        grouped_listings = {
            'view': view_listings,
            'admin': admin_listings
        }

        # Step 7: Fetch Listing Versions
        sql_versions = """
        SELECT json_id, listing_id, created_at
        FROM t_hbb_listing_json
        WHERE user_id = %s
        AND json_id IS NOT NULL
        AND listing_id IS NOT NULL
        AND user_id IS NOT NULL        
        AND active = TRUE
        ORDER BY created_at;
        """
        # print(f"DEBUG: Fetching listing versions using query:\n{sql_versions}")
        cursor.execute(sql_versions, (user_id,))
        versions_results = cursor.fetchall()
        # print(f"DEBUG: Retrieved {len(versions_results)} listing versions.")

        # Convert listing versions to dictionary format
        versions = {}
        for version in versions_results:
            json_id, listing_id, created_at = version
            if listing_id in versions:
                versions[listing_id].append({"json_id": json_id, "listing_id": listing_id, "created_at": created_at})
            else:
                versions[listing_id] = [{"json_id": json_id, "listing_id": listing_id, "created_at": created_at}]

        # print(f"DEBUG: Listing Versions: {versions}")

        # Step 8: Return Response
        response = {
            "listings": grouped_listings,
            "versions": versions
        }
        # print(f"DEBUG: Returning Response: {response}")

        return jsonify(response), 200

    except Exception as e:
        print(f"ERROR: An error occurred in get_user_listings: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()




@app.route('/api/verify_assistant', methods=['POST'])
def verify_assistant():
    try:
        data = request.json
        assistant_name = data.get('assistant_name')

        if not assistant_name:
            return jsonify({"success": False, "message": "Assistant name is required."}), 400

        # Make an API call to OpenAI to get the list of assistants
        response = requests.get(
            'https://api.openai.com/v1/assistants?order=desc&limit=20',
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2"
            }
        )

        assistants = response.json().get("data", [])

        # Check if assistant exists in the list
        for assistant in assistants:
            if assistant['id'].lower() == assistant_name.lower():
                return jsonify({"success": True, "assistant_id": assistant['id']}), 200

        return jsonify({"success": False, "message": "Assistant not found."}), 404

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500



@app.route('/api/listing-admin-action', methods=['POST'])
def listing_admin_action():
    try:
        # Extract the data from the request
        site_json = request.form.get('siteJson')
        action_type = request.form.get('actionType')  # Either 'create' or 'edit'
        print('LISTING_ADMIN, action_type', action_type)
        # print('LISTING_ADMIN, site_json', site_json)

        if not site_json or not action_type:
            return jsonify({'success': False, 'message': 'siteJson and actionType are required'}), 400

        # Deserialize siteJson
        site_data = json.loads(site_json)

        # Extract the listing_id from the deserialized JSON
        listing_id = site_data.get('listing', {}).get('listing_id')

        if not listing_id:
            return jsonify({'success': False, 'message': 'Listing ID is required'}), 400

        print(f'Listing ID: {listing_id}')  # Debugging statement to verify the listing_id extraction

        # Print the image_bubble_game section for debugging
        image_bubble_game = site_data.get('games', {}).get('image_bubble_game', {})
        # print('image_bubble_game:', json.dumps(image_bubble_game, indent=4))

        # DO NOT DELETE DEFAULT LISTING
        if (action_type == 'edit') & (listing_id.lower() == os.getenv('DEFAULT_LISTING_ID')):
            print('DEBUG: DEFAULT LISTING: DO NOT DELETE')
            action_type = 'create'

        # RUN WITHOUT AN ID ENSURESTHE IDs ARE ALL LOWER CASE
        site_data = admin.update_listing_id(nested_dict=site_data, new_id=None)
        site_data = site_data[0]

        new_id = uuid.uuid4()
        write_listing_id = str(new_id)
        # Call upsert_listing based on actionType
        # print('BEFORE RUN', action_type)
        if action_type == 'create':
            master_listing_id = str(uuid.uuid4())
            site_data['listing']['master_listing_id'] = master_listing_id
        else:
            master_listing_id = site_data['listing']['master_listing_id']
        # else:
        # return jsonify({'success': False, 'message': f"Unknown action type: {action_type}"}), 400

        print('MASTER_LISTING_ID', master_listing_id)
        # ASSIGN LISTING ID
        new_site_data = admin.update_listing_id(nested_dict=site_data, new_id=write_listing_id)
        new_site_data = new_site_data[0]

        # ENSURE IMAGES A QUESTION IDS ARE SYNCHONIZED
        new_site_data["games"]["bin_game"] = admin.synchronize_game_iqmap_ids(
            game_dict=new_site_data["games"]["bin_game"])

        # Print the image_bubble_game section for debugging
        # print('BEFORE:', json.dumps(new_site_data["games"]["image_bubble_game"], indent=4))
        new_site_data["games"]["image_bubble_game"] = admin.synchronize_game_iqmap_ids(
            new_site_data["games"]["image_bubble_game"])
        # print('AFTER:', json.dumps(new_site_data["games"]["image_bubble_game"], indent=4))

        print('Write New Site Data ToDatabase')
        listing_id = admin.upsert_listing(new_site_data,
                                          user_id=retrieve_session_variable('USER_ID'))  # Insert new listing

        # # assign Admin Privledges For this Listing
        # upsert_user_listing(listing_id, user_id=retrieve_session_variable('USER_ID'), rights='admin')

        # Handle Image Upload
        # IF EDIT THEN HANDLE BLOB DELETION
        # if (listing_id.lower() != os.getenv('DEFAULT_LISTING_ID')):
        #     base_url = return_blob_base_listing_url(master_listing_id.lower())
        #     # base_url = return_blob_base_listing_url(listing_id.lower())
        #     # print('DELETING IMAGES', master_listing_id, base_url)
        #     # DELETE BLOB IMAGES
        #     blob_delete_by_prefix(base_url)
        #     # print('FINISHED DELETING IMAGES')

        # Handle image uploads
        print('[DEBUG]: UPLOADING FILES PRE REQUEST')
        uploaded_files = request.files
        print('UPLOADING FILES')
        for file_key in uploaded_files:
            file = uploaded_files[file_key]
            print('[DEBUG]: Starting File Upload', file.filename)
            filename = secure_filename(file.filename)
            # blob_url = blob_upload(file, filename, listing_id)
            blob_url = blob_upload(file, filename, master_listing_id)
            print(f"Uploaded file: {filename} to URL: {blob_url}")

        return jsonify({'success': True, 'listing_id': listing_id}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/get_site_json', methods=['GET'])
def get_site_json():

    gen_listing_id = request.args.get('listing_id').lower()
    set_listing_id = request.args.get('set_listing_id', 'true').lower() == 'true'
    # print('[DEBUG]: get_site_json(): gen_listing_id', gen_listing_id, 'SET_LISTING_ID', set_listing_id)

    if not gen_listing_id:
        return jsonify({'success': False, 'message': 'listing_id is required'}), 400

    # IF THERE IS A LISTING ID THEN IT MIGHT BE A MASTER (FROM THE SITE) OR IT MIGHT BEAND INDIVIDUAL (FROM ADMIN)
    listing_id = get_active_listing_id(gen_listing_id)
    # print('GETTING JSON FOR', listing_id)
    if not listing_id:
        listing_id = gen_listing_id

    try:
        # SET LISTING_ID
        if set_listing_id:
            set_session_variable('LISTING_ID', listing_id.lower())
            # set_session_variable('MASTER_LISTING_ID', master_listing_id.lower())
        # Call the `build_site_json` function to get the JSON structure for the given listing_id
        site_json = admin.build_site_json(listing_id.lower())
        # print('DEBUG: site_json', json.dumps(site_json, indent=4))
        return jsonify(site_json), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/reset_listing_id', methods=['POST'])
def reset_listing_id():
    try:
        # Reset the session variable for LISTING_ID
        set_session_variable('MASTER_LISTING_ID', "")
        return jsonify({"success": True, "message": "MASTER Listing ID reset successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to reset listing ID: {str(e)}"}), 500


@app.route('/api/get_listing_id', methods=['GET'])
def get_listing_id():
    """
    Returns the listing ID stored in the session if available.
    """
    master_listing_id = retrieve_session_variable('MASTER_LISTING_ID')
    id_from_url = retrieve_session_variable('ID_FROM_URL')
    # print('[DEBUG] get_listing_id(): sending', master_listing_id, id_from_url)
    return {'listing_id': master_listing_id, 'id_from_url': id_from_url}, 200

@app.route('/api/get_response_json', methods=['GET'])
def get_response_json():
    # Retrieve the extracted JSON from the session
    if 'RESPONSE_JSON' in session:
        print('RESPONSE_JSON IN SESSION')
    else:
        print('RESPONSE_JSON NOT IN SESSION')
    response_json = retrieve_session_variable('RESPONSE_JSON')
    # print('GET RESPONSE', response_json)
    if response_json is None:
        return jsonify({'error': 'No JSON response available'}), 404
    return jsonify({'response_json': response_json}), 200

@app.route('/api/update_user_admin_rights', methods=['POST'])
def update_user_admin_rights():
    try:
        # Establish a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Define the user IDs
        user_ids = [
            {'user_id': '687a9709-1136-47dc-9b4c-c63956e3a814', 'param': '@usere'},
            {'user_id': '8fc366a2-90a2-4b2e-a5a8-708a2a6a8a95', 'param': '@usera'}
        ]

        # Delete existing records for these user IDs
        delete_query = "DELETE FROM t_hbb_user_listing3 WHERE user_id = ?"
        for user in user_ids:
            cursor.execute(delete_query, (user['user_id'],))
        conn.commit()

        # Insert admin rights for each user ID
        insert_query = """
        INSERT INTO t_hbb_user_listing3 (user_id, listing_id, rights, status)
        SELECT ?, listing_id, 'admin', 'active'
        FROM t_hbb_listing
        WHERE listing_id NOT IN (
            SELECT listing_id
            FROM t_hbb_user_listing3
            WHERE user_id = ? AND rights = 'admin'
        )
        """
        for user in user_ids:
            cursor.execute(insert_query, (user['user_id'], user['user_id']))
        conn.commit()

        # Return success response
        return jsonify({"message": "Admin rights updated successfully"}), 200

    except Exception as e:
        # Log and return any errors
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Ensure resources are closed
        cursor.close()
        conn.close()

@app.route('/api/test', methods=['GET'])
def test_route():
    app.logger.info("[DEBUG] /api/test route was hit")
    return jsonify({"message": "Flask is working!"}), 200

@app.route('/api/get_statistics', methods=['GET'])
def get_statistics():
    master_listing_id = request.args.get('master_listing_id').lower()
    # print('IN GET STATISTICS', master_listing_id)
    if not master_listing_id:
        return jsonify({'error': 'master_listing_id is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    # print('AFTER BUILDING CONNECTION')

    try:
        # Example: Total visitors
        cursor.execute("""
            SELECT COUNT(DISTINCT log.session_id) AS visitor_count
            FROM t_hbb_site_user_log AS log
            JOIN t_hbb_master_listing AS ml 
                ON ml.listing_id = log.listing_id
            WHERE ml.master_listing_id = ?
        """, (master_listing_id,))

        result = cursor.fetchone()

        # visitor_count = cursor.fetchone()['visitor_count']
        # print('VISITOR COUNT', visitor_count)
        # Aggregate all statistics into a single response
        data = {
            'visitor_count': result[0],
        }

        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        conn.close()
if __name__ == '__main__':
    # print("[DEBUG] Registered Routes:", app.url_map)
    app.run(debug=False)
