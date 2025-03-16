import pyodbc
import uuid
import json
# def get_db_connection():
#     connection_string = "Driver={ODBC Driver 18 for SQL Server};Server=tcp:dbb-2.database.windows.net,1433;Database=HBB-2;Uid=naflon;Pwd=M6o6n6a2!;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
#     return pyodbc.connect(connection_string, autocommit=True)
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

def update_listing_id(nested_dict, new_id=None, build_new_child_ids=True, id_mapping=None):
    """
    Recursively find and update '_id' keys in a nested dictionary.

    Args:
    - nested_dict: The dictionary to traverse.
    - new_id: Optional new ID to replace the 'listing_id' value.
    - build_new_child_ids: Boolean flag to determine if child IDs should be regenerated.
    - id_mapping: A dictionary to keep track of old-to-new ID mappings.

    Returns:
    - The updated dictionary and the ID mapping.
    """
    if id_mapping is None:
        id_mapping = {}

    for key, value in nested_dict.items():
        # print(key)
        # Check if the key ends with "_id"
        if key.endswith("_id"):
            if isinstance(value, str):
                # Convert current ID to lowercase
                nested_dict[key] = value.lower()

                # If key is 'listing_id' and new_id is provided, update it
                if key == "listing_id" and new_id is not None:
                    nested_dict[key] = new_id.lower()

                # Otherwise, handle child IDs
                elif key == "master_listing_id":
                    print("master_listing_id FOUND")
                elif build_new_child_ids:
                    # If value not in id_mapping, assign a new UUID
                    if value not in id_mapping:
                        new_uuid = str(uuid.uuid4())
                        id_mapping[value] = new_uuid
                    # Update the ID to new ID from mapping
                    nested_dict[key] = id_mapping[value]

        # Handle nested dictionaries
        elif isinstance(value, dict):
            update_listing_id(value, new_id, build_new_child_ids, id_mapping)

        # Handle lists of dictionaries (e.g., 'carousel' list in the example)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    update_listing_id(item, new_id, build_new_child_ids, id_mapping)
    return nested_dict, id_mapping
def update_agent_data(nested_dict):
    agent_id = nested_dict['agent']['agent_id']
    agent_logo_id = nested_dict['agent']['listing_agent_logo_id']
    if 'logos_0' in nested_dict['agent']:
        nested_dict['agent']['logos_0']['listing_agent_logo_id'] = agent_logo_id
        logo_image_id = nested_dict['agent']['logos_0']['logo_image_id']
        nested_dict['agent']['images_0']['image_id'] = logo_image_id
    if 'logos_1' in nested_dict['agent']:
        nested_dict['agent']['logos_1']['listing_agent_logo_id'] = agent_logo_id
        logo_image_id = nested_dict['agent']['logos_1']['logo_image_id']
        nested_dict['agent']['images_1']['image_id'] = logo_image_id
    return nested_dict

def synchronize_game_iqmap_ids(game_dict, field = 'iqmap'):
    """
    Synchronize iqmap values between 'images_*' and 'questions_*' within a single game dictionary.

    Args:
    - game_dict: A dictionary containing 'images_*' and 'questions_*' entries.

    Returns:
    - The updated game dictionary with synchronized iqmap values.
    """
    # Create a set of iqmap values from the images entries
    image_iqmap_set = {value[field] for key, value in game_dict.items()
                       if key.startswith("images_") and isinstance(value, dict) and field in value}

    # Traverse through 'questions_*' entries and ensure their iqmap matches an existing image iqmap
    for key, value in game_dict.items():
        if key.startswith("questions_") and isinstance(value, dict) and field in value:
            if value[field] not in image_iqmap_set:
                print(f"Warning: iqmap {value[field]} in {key} does not match any image iqmap.")
                # Optional: Set the iqmap to a default or remove the question if needed

    return game_dict

def get_user_logs(master_listing_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()


        # Fetch the master_listing_id associated with the listing_id
        cursor.execute("""
                SELECT
                       log.log_id
                      ,log.listing_id
                      ,log.user_id
                      ,u.first_name
                      ,u.last_name
                      ,u.email
                      ,u.anon
                      ,u.phone
                      ,u.represented_by_agent
                      ,log.created_at
                      ,log.question
                      ,log.system_prompt
                      ,log.question_source
                      ,log.answer
                      ,log.session_id
                      ,log.action
                      ,log.action_source
                  FROM [dbo].[t_hbb_site_user_log] as log
                  JOIN dbo.t_hbb_master_listing as ml 
                    ON ml.listing_id = log.listing_id
                  AND ml.master_listing_id = ?
                  JOIN dbo.t_hbb_user as u 
                    ON u.userid = log.user_id
                  WHERE log.session_id is not NULL
                  ORDER BY created_at DESC

            """,
            (master_listing_id.lower(),))
        # Fetch all rows from the query
        rows = cursor.fetchall()


        # Get column names from the cursor
        columns = [column[0] for column in cursor.description]
        # Create a DataFrame
        import pandas as pd
        user_log_df = pd.DataFrame.from_records(rows, columns=columns)

        # Normalize 'action' and 'question_source' columns
        user_log_df['action'] = user_log_df['action'].astype(str).str.strip().str.lower()
        user_log_df['question_source'] = user_log_df['question_source'].astype(str).str.strip().str.lower()

        # Define actions and question_sources to exclude
        exclude_actions = ['binimageqgame', 'imagebubblegame', 'binimagegame', 'welcomepage', 'carousel']
        exclude_question_sources = ['next image', 'prev image', 'context question', 'neighborhood', 'agent']  # Replace with actual values

        # Filter rows where 'action' and 'question_source' are not in the exclude lists
        chat_logs = user_log_df[
            ~user_log_df['action'].isin(exclude_actions) &
            ~user_log_df['question_source'].isin(exclude_question_sources)
            ].reset_index(drop=True)

        # fill in from next row
        for index in range(len(chat_logs) - 1):
            current_row = chat_logs.iloc[index]
            next_row = chat_logs.iloc[index + 1]

            # Check condition for current row
            if current_row['answer'] is not pd.NA and len(current_row['system_prompt']) == 0:
                # Update current row with values from the next row

                chat_logs.at[index, 'question'] = next_row['question']
                chat_logs.at[index, 'system_prompt'] = next_row['question']
                chat_logs.at[index, 'question_source'] = next_row['question_source']
                if next_row['question_source'] == 'user response canceled':
                    chat_logs.at[index, 'system_prompt'] = 'user response canceled'
                    next_next_row = chat_logs.iloc[index + 2]
                    chat_logs.at[index, 'question_source'] = next_next_row['question_source']
                    chat_logs.at[index, 'question'] = next_next_row['question']
        chat_logs = chat_logs[chat_logs['answer'].notna()].reset_index(drop=True)
        import json

        # Assuming 'answer' column contains JSON strings
        chat_logs['answer_text'] = chat_logs['answer'].apply(lambda x: json.loads(x)['text'] if pd.notna(x) else None)
        chat_logs.to_csv('c:\\temp\\chat_logs.csv')

        # Set master_listing_id to the JSON or None if no master_listing_id is found
        site_json["listing"]["master_listing_id"] = master_listing_data.master_listing_id if master_listing_data else None
        site_json["listing"]["active"] = master_listing_data.active if master_listing_data else 0


        # Fetch data for `t_hbb_listing`
        cursor.execute("SELECT listing_id FROM t_hbb_listing WHERE listing_id = ?", listing_id)
        listing_data = cursor.fetchone()
        if listing_data:
            site_json["listing"]["listing_id"] = listing_data.listing_id

        # Fetch listing details
        cursor.execute("""
            SELECT LOWER([listing_id]), [listing_image_id], [listing_agent_id], [listing_assistant_name],
                   [listing_description], [listing_address], [created_at]
            FROM [t_hbb_listing_detail]
            WHERE listing_id = ?
        """, listing_id)
        listing_detail_data = cursor.fetchone()
        if listing_detail_data:
            site_json["listing"]["listing_details"] = {
                "listing_image_id": listing_detail_data.listing_image_id,
                "listing_agent_id": listing_detail_data.listing_agent_id,
                "listing_assistant_name": listing_detail_data.listing_assistant_name,
                "listing_description": listing_detail_data.listing_description,
                "listing_address": listing_detail_data.listing_address
            }

        # Fetch images associated with the listing detail
        cursor.execute("""
            SELECT i.[image_id], i.[image_file_name], i.[image_url], i.[image_description]
            FROM [t_hbb_image] as i
            JOIN [t_hbb_listing_detail] as d ON i.image_id = d.listing_image_id
            WHERE d.listing_id = ?
        """, listing_id)
        image_data = cursor.fetchall()
        # If images exist, add them to the listing details
        if image_data:
            for img, i in zip(image_data, range(len(image_data))):
                site_json["listing"]["images_" + str(i)] = {
                        "image_id": img.image_id,
                        "image_file_name": img.image_file_name,
                        "image_url": img.image_url,
                        "image_description": img.image_description
                }

        # FETCH AGENT DETAILS
        agent_id = ''
        cursor.execute("""
        SELECT agent_id, 
               listing_id, 
               listing_agent_name, 
               listing_agent_logo_id, 
               listing_agent_description 
          FROM t_hbb_listing_agent 
          WHERE listing_id = ?
        """, listing_id)
        agent_data = cursor.fetchone()
        if agent_data:
            agent_id = agent_data.agent_id.lower()
            site_json["agent"]= {
                "agent_id": agent_data.agent_id,
                "listing_id": agent_data.listing_id,
                "listing_agent_name": agent_data.listing_agent_name,
                "listing_agent_logo_id": agent_data.listing_agent_logo_id,
                "listing_agent_description": agent_data.listing_agent_description
            }
        # FETCH LOGO FOR AGENT
        cursor.execute("""
        SELECT listing_agent_logo_id,
               logo_image_id,
               agent_id,
               logo_description
          FROM t_hbb_listing_agent_logo
         WHERE agent_id = ?
        """, agent_id)
        agent_logo_data = cursor.fetchall()
        for logo, i in zip(agent_logo_data, range(len(agent_logo_data))):
            site_json["agent"]["logos_" + str(i)] = {
                "listing_agent_logo_id": logo.listing_agent_logo_id,
                "logo_image_id": logo.logo_image_id,
                "agent_id": logo.agent_id,
                "logo_description": logo.logo_description
            }
        # Fetch images associated with the listing detail
        cursor.execute("""
            SELECT i.[image_id], i.[image_file_name], i.[image_url], i.[image_description]
            FROM [t_hbb_image] as i
            JOIN [t_hbb_listing_agent_logo] as logo ON i.image_id = logo.logo_image_id
            WHERE logo.agent_id = ?
        """, agent_id)
        image_data = cursor.fetchall()
        # If images exist, add them to the listing details
        if image_data:
            for img, i in zip(image_data, range(len(image_data))):
                site_json["agent"]["images_" + str(i)] = {
                        "image_id": img.image_id,
                        "image_file_name": img.image_file_name,
                        "image_url": img.image_url,
                        "image_description": img.image_description
                }



        # Fetch assistant details
        cursor.execute("""
            SELECT [listing_id], [assistant_id_OAI], [assistant_description]
            FROM [t_hbb_listing_assistant]
            WHERE listing_id = ?
        """, listing_id)
        assistant_data = cursor.fetchone()

        if assistant_data:
            site_json["assistant"] = {
                "listing_id": assistant_data.listing_id,
                "assistant_id_OAI": assistant_data.assistant_id_OAI,
                "assistant_description": assistant_data.assistant_description
            }

        # Fetch carousel details
        cursor.execute("""
            SELECT [listing_id], [carousel_type], [site_location], [image_order], [image_file_name],
                   [image_tile_destination], [image_tile_description], [image_tile_instructions],
                   [image_click_user_prompt], [image_click_system_prompt]
            FROM [t_hbb_site_carousel]
            WHERE listing_id = ?
        """, listing_id)
        carousel_data = cursor.fetchall()

        if carousel_data:
            site_json["carousel"] = []
            for item in carousel_data:
                site_json["carousel"].append({
                    "listing_id": item.listing_id,
                    "carousel_type": item.carousel_type,
                    "site_location": item.site_location,
                    "image_order": item.image_order,
                    "image_file_name": item.image_file_name,
                    "image_tile_destination": item.image_tile_destination,
                    "image_tile_description": item.image_tile_description,
                    "image_tile_instructions": item.image_tile_instructions,
                    "image_click_user_prompt": item.image_click_user_prompt,
                    "image_click_system_prompt": item.image_click_system_prompt
                })

        # Fetch BinQImageGame data
        cursor.execute("""
            SELECT [image_id], [listing_id], [image_name], [image_file],
                   [image_description], [image_user_prompt], [image_system_prompt], 
                   [image_order], [location_id], COALESCE([iqmap], 'default_value') AS [iqmap]
            FROM [t_hbb_BinQImageGame_images]
            WHERE listing_id = ?
        """, listing_id)
        bin_game_images = cursor.fetchall()
        for image, i in zip(bin_game_images, range(len(bin_game_images))):
            site_json["games"]["bin_game"]["images_" + str(i)] = {
                "image_id": image.image_id,
                "image_name": image.image_name,
                "image_file": image.image_file,
                "image_description": image.image_description,
                "image_user_prompt": image.image_user_prompt,
                "image_system_prompt": image.image_system_prompt,
                "image_order": image.image_order,
                "location_id": image.location_id,
                "iqmap": image.iqmap

            }

        # Fetch BinQImageGame Questions
        cursor.execute("""
            SELECT q.[image_id], q.[question], q.[question_type], q.[question_order], COALESCE(q.[iqmap], 'default_value') AS [iqmap]
            FROM [t_hbb_BinQImageGame_questions] as q
            JOIN t_hbb_BinQImageGame_images as i 
              ON q.iqmap = i.iqmap
             AND q.listing_id = i.listing_id
            WHERE i.listing_id = ?
        """, listing_id)
        bin_game_questions = cursor.fetchall()
        for question, i in zip(bin_game_questions, range(len(bin_game_questions))):
            site_json["games"]["bin_game"]["questions_" + str(i)] = {
                "image_id": question.image_id,
                "question": question.question,
                "question_type": question.question_type,
                "question_order": question.question_order,
                "iqmap": question.iqmap,
                "listing_id": listing_id
            }

        # Fetch ImageBubbleGame data
        cursor.execute("""
            SELECT [image_id], [listing_id], [image_name], [image_file], [image_description],
                   [image_user_prompt], [image_system_prompt], [image_order], [location_id], COALESCE([iqmap], 'default_value') AS [iqmap], [number_of_answers_expected]
            FROM [t_hbb_ImageBubbleGame_images]
            WHERE listing_id = ?
        """, listing_id)
        bubble_game_images = cursor.fetchall()
        for image, i in zip(bubble_game_images, range(len(bubble_game_images))):
            site_json["games"]["image_bubble_game"]["images_" + str(i)] = {
                "image_id": image.image_id,
                "image_name": image.image_name,
                "image_file": image.image_file,
                "image_description": image.image_description,
                "image_user_prompt": image.image_user_prompt,
                "image_system_prompt": image.image_system_prompt,
                "image_order": image.image_order,
                "location_id": image.location_id,
                "iqmap": image.iqmap,
                "number_of_answers_expected": image.number_of_answers_expected
            }

        # Fetch ImageBubbleGame Questions
        cursor.execute("""
            SELECT q.[image_id], q.[question], q.[question_type], q.[question_order], COALESCE(q.[iqmap], 'default_value') AS [iqmap]
            FROM [t_hbb_ImageBubbleGame_questions] as q
            JOIN t_hbb_ImageBubbleGame_images as i 
              ON q.iqmap = i.iqmap
             AND q.listing_id = i.listing_id
            WHERE i.listing_id = ?
        """, listing_id)
        bubble_game_questions = cursor.fetchall()
        for question, i in zip(bubble_game_questions, range(len(bubble_game_questions))):
            site_json["games"]["image_bubble_game"]["questions_" + str(i)] = {
                "image_id": question.image_id,
                "question": question.question,
                "question_type": question.question_type,
                "question_order": question.question_order,
                "iqmap": question.iqmap,
                "listing_id": listing_id
            }

        # Fetch predetermined questions
        cursor.execute("""
            SELECT [question_id], [listing_id], [system_prompt_text], [response_text]
            FROM [t_hbb_predetermined_responses]
            WHERE listing_id = ?
        """, listing_id)
        predetermined_questions = cursor.fetchall()
        for question, i in zip(predetermined_questions, range(len(predetermined_questions))):
            site_json["questions"]["predetermined_questions_" + str(i)] = {
                "question_id": question.question_id,
                "listing_id": question.listing_id,
                "system_prompt_text": question.system_prompt_text,
                "response_text": question.response_text
            }

        # Fetch site location questions
        cursor.execute("""
            SELECT [listing_id], [SITE_LOCATION], [quick_question], [quick_question_system_prompt], [qucik_question_order]
            FROM [t_hbb_site_location_questions]
            WHERE listing_id = ?
        """, listing_id)
        site_location_questions = cursor.fetchall()
        for question, i in zip(site_location_questions, range(len(site_location_questions))):
            site_json["questions"]["site_location_questions_" + str(i)] = {
                "listing_id": question.listing_id,
                "SITE_LOCATION": question.SITE_LOCATION,
                "quick_question": question.quick_question,
                "quick_question_system_prompt": question.quick_question_system_prompt,
                "qucik_question_order": question.qucik_question_order
            }

        # Fetch conversation topic questions
        cursor.execute("""
            SELECT [question_id], [listing_id], [CONVOTOP], [quick_question], [quick_question_system_prompt], [qucik_question_order]
            FROM [t_hbb_site_convotop_questions]
            WHERE listing_id = ?
        """, listing_id)
        convotop_questions = cursor.fetchall()
        for question, i in zip(convotop_questions, range(len(convotop_questions))):
            site_json["questions"]["conversation_topic_questions_" + str(i)] = {
                "question_id": question.question_id,
                "listing_id": question.listing_id,
                "CONVOTOP": question.CONVOTOP,
                "quick_question": question.quick_question,
                "quick_question_system_prompt": question.quick_question_system_prompt,
                "qucik_question_order": question.qucik_question_order
            }

        # Close the connection
        cursor.close()
        conn.close()

        return site_json
    except:
        raise

# def synchronize_game_image_ids(game_dict):
#     """
#     Synchronize image_id values between 'images_*' and 'questions_*' within a single game dictionary.
#
#     Args:
#     - game_dict: A dictionary containing 'images_*' and 'questions_*' entries.
#
#     Returns:
#     - The updated game dictionary with synchronized 'image_id' values.
#     """
#     # Create a mapping of image positions to image IDs
#     image_id_map = {}
#
#     # Traverse through 'images_*' entries and build the mapping
#     for key, value in game_dict.items():
#         if key.startswith("images_") and isinstance(value, dict) and "image_id" in value:
#             image_id_map[key.split("_")[1]] = value["image_id"]
#
#     # Traverse through 'questions_*' entries and update 'image_id' values using the image_id_map
#     for key, value in game_dict.items():
#         if key.startswith("questions_") and isinstance(value, dict) and "image_id" in value:
#             # Extract the numeric suffix to find the corresponding image ID
#             index = key.split("_")[1]
#             if index in image_id_map:
#                 value["image_id"] = image_id_map[index]  # Update with the corresponding image_id
#
#
#
#     return game_dict# Function to construct the site JSON
# def build_site_json(listing_id):
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Initialize the JSON structure
#         site_json = {
#             "listing": {},
#             "assistant": {},
#             "carousel": {},
#             "games": {
#                 "bin_game": {
#                 },
#                 "image_bubble_game": {
#                 }
#             },
#             "questions": {
#                 # "predetermined_questions": {},
#                 # "site_location_questions": {},
#                 # "conversation_topic_questions": {}
#             }
#         }
#
#
#         # Fetch the master_listing_id associated with the listing_id
#         cursor.execute("""
#             SELECT master_listing_id, active
#             FROM t_hbb_master_listing
#             WHERE listing_id = ?""",
#             (listing_id.lower(),))
#         master_listing_data = cursor.fetchone()
#
#         # Set master_listing_id to the JSON or None if no master_listing_id is found
#         site_json["listing"]["master_listing_id"] = master_listing_data.master_listing_id if master_listing_data else None
#         site_json["listing"]["active"] = master_listing_data.active if master_listing_data else 0
#
#
#         # Fetch data for `t_hbb_listing`
#         cursor.execute("SELECT listing_id FROM t_hbb_listing WHERE listing_id = ?", listing_id)
#         listing_data = cursor.fetchone()
#         if listing_data:
#             site_json["listing"]["listing_id"] = listing_data.listing_id
#
#         # Fetch listing details
#         cursor.execute("""
#             SELECT LOWER([listing_id]), [listing_image_id], [listing_agent_id], [listing_assistant_name],
#                    [listing_description], [listing_address], [created_at]
#             FROM [t_hbb_listing_detail]
#             WHERE listing_id = ?
#         """, listing_id)
#         listing_detail_data = cursor.fetchone()
#         if listing_detail_data:
#             site_json["listing"]["listing_details"] = {
#                 "listing_image_id": listing_detail_data.listing_image_id,
#                 "listing_agent_id": listing_detail_data.listing_agent_id,
#                 "listing_assistant_name": listing_detail_data.listing_assistant_name,
#                 "listing_description": listing_detail_data.listing_description,
#                 "listing_address": listing_detail_data.listing_address
#             }
#
#         # Fetch images associated with the listing detail
#         cursor.execute("""
#             SELECT i.[image_id], i.[image_file_name], i.[image_url], i.[image_description]
#             FROM [t_hbb_image] as i
#             JOIN [t_hbb_listing_detail] as d ON i.image_id = d.listing_image_id
#             WHERE d.listing_id = ?
#         """, listing_id)
#         image_data = cursor.fetchall()
#         # If images exist, add them to the listing details
#         if image_data:
#             for img, i in zip(image_data, range(len(image_data))):
#                 site_json["listing"]["images_" + str(i)] = {
#                         "image_id": img.image_id,
#                         "image_file_name": img.image_file_name,
#                         "image_url": img.image_url,
#                         "image_description": img.image_description
#                 }
#
#         # FETCH AGENT DETAILS
#         agent_id = ''
#         cursor.execute("""
#         SELECT agent_id,
#                listing_id,
#                listing_agent_name,
#                listing_agent_logo_id,
#                listing_agent_description
#           FROM t_hbb_listing_agent
#           WHERE listing_id = ?
#         """, listing_id)
#         agent_data = cursor.fetchone()
#         if agent_data:
#             agent_id = agent_data.agent_id.lower()
#             site_json["agent"]= {
#                 "agent_id": agent_data.agent_id,
#                 "listing_id": agent_data.listing_id,
#                 "listing_agent_name": agent_data.listing_agent_name,
#                 "listing_agent_logo_id": agent_data.listing_agent_logo_id,
#                 "listing_agent_description": agent_data.listing_agent_description
#             }
#         # FETCH LOGO FOR AGENT
#         cursor.execute("""
#         SELECT listing_agent_logo_id,
#                logo_image_id,
#                agent_id,
#                logo_description
#           FROM t_hbb_listing_agent_logo
#          WHERE agent_id = ?
#         """, agent_id)
#         agent_logo_data = cursor.fetchall()
#         for logo, i in zip(agent_logo_data, range(len(agent_logo_data))):
#             site_json["agent"]["logos_" + str(i)] = {
#                 "listing_agent_logo_id": logo.listing_agent_logo_id,
#                 "logo_image_id": logo.logo_image_id,
#                 "agent_id": logo.agent_id,
#                 "logo_description": logo.logo_description
#             }
#         # Fetch images associated with the listing detail
#         cursor.execute("""
#             SELECT i.[image_id], i.[image_file_name], i.[image_url], i.[image_description]
#             FROM [t_hbb_image] as i
#             JOIN [t_hbb_listing_agent_logo] as logo ON i.image_id = logo.logo_image_id
#             WHERE logo.agent_id = ?
#         """, agent_id)
#         image_data = cursor.fetchall()
#         # If images exist, add them to the listing details
#         if image_data:
#             for img, i in zip(image_data, range(len(image_data))):
#                 site_json["agent"]["images_" + str(i)] = {
#                         "image_id": img.image_id,
#                         "image_file_name": img.image_file_name,
#                         "image_url": img.image_url,
#                         "image_description": img.image_description
#                 }
#
#
#
#         # Fetch assistant details
#         cursor.execute("""
#             SELECT [listing_id], [assistant_id_OAI], [assistant_description]
#             FROM [t_hbb_listing_assistant]
#             WHERE listing_id = ?
#         """, listing_id)
#         assistant_data = cursor.fetchone()
#
#         if assistant_data:
#             site_json["assistant"] = {
#                 "listing_id": assistant_data.listing_id,
#                 "assistant_id_OAI": assistant_data.assistant_id_OAI,
#                 "assistant_description": assistant_data.assistant_description
#             }
#
#         # Fetch carousel details
#         cursor.execute("""
#             SELECT [listing_id], [carousel_type], [site_location], [image_order], [image_file_name],
#                    [image_tile_destination], [image_tile_description], [image_tile_instructions],
#                    [image_click_user_prompt], [image_click_system_prompt]
#             FROM [t_hbb_site_carousel]
#             WHERE listing_id = ?
#         """, listing_id)
#         carousel_data = cursor.fetchall()
#
#         if carousel_data:
#             site_json["carousel"] = []
#             for item in carousel_data:
#                 site_json["carousel"].append({
#                     "listing_id": item.listing_id,
#                     "carousel_type": item.carousel_type,
#                     "site_location": item.site_location,
#                     "image_order": item.image_order,
#                     "image_file_name": item.image_file_name,
#                     "image_tile_destination": item.image_tile_destination,
#                     "image_tile_description": item.image_tile_description,
#                     "image_tile_instructions": item.image_tile_instructions,
#                     "image_click_user_prompt": item.image_click_user_prompt,
#                     "image_click_system_prompt": item.image_click_system_prompt
#                 })
#
#         # Fetch BinQImageGame data
#         cursor.execute("""
#             SELECT [image_id], [listing_id], [image_name], [image_file],
#                    [image_description], [image_user_prompt], [image_system_prompt],
#                    [image_order], [location_id], COALESCE([iqmap], 'default_value') AS [iqmap]
#             FROM [t_hbb_BinQImageGame_images]
#             WHERE listing_id = ?
#         """, listing_id)
#         bin_game_images = cursor.fetchall()
#         for image, i in zip(bin_game_images, range(len(bin_game_images))):
#             site_json["games"]["bin_game"]["images_" + str(i)] = {
#                 "image_id": image.image_id,
#                 "image_name": image.image_name,
#                 "image_file": image.image_file,
#                 "image_description": image.image_description,
#                 "image_user_prompt": image.image_user_prompt,
#                 "image_system_prompt": image.image_system_prompt,
#                 "image_order": image.image_order,
#                 "location_id": image.location_id,
#                 "iqmap": image.iqmap
#
#             }
#
#         # Fetch BinQImageGame Questions
#         cursor.execute("""
#             SELECT q.[image_id], q.[question], q.[question_type], q.[question_order], COALESCE(q.[iqmap], 'default_value') AS [iqmap]
#             FROM [t_hbb_BinQImageGame_questions] as q
#             JOIN t_hbb_BinQImageGame_images as i
#               ON q.iqmap = i.iqmap
#              AND q.listing_id = i.listing_id
#             WHERE i.listing_id = ?
#         """, listing_id)
#         bin_game_questions = cursor.fetchall()
#         for question, i in zip(bin_game_questions, range(len(bin_game_questions))):
#             site_json["games"]["bin_game"]["questions_" + str(i)] = {
#                 "image_id": question.image_id,
#                 "question": question.question,
#                 "question_type": question.question_type,
#                 "question_order": question.question_order,
#                 "iqmap": question.iqmap,
#                 "listing_id": listing_id
#             }
#
#         # Fetch ImageBubbleGame data
#         cursor.execute("""
#             SELECT [image_id], [listing_id], [image_name], [image_file], [image_description],
#                    [image_user_prompt], [image_system_prompt], [image_order], [location_id], COALESCE([iqmap], 'default_value') AS [iqmap], [number_of_answers_expected]
#             FROM [t_hbb_ImageBubbleGame_images]
#             WHERE listing_id = ?
#         """, listing_id)
#         bubble_game_images = cursor.fetchall()
#         for image, i in zip(bubble_game_images, range(len(bubble_game_images))):
#             site_json["games"]["image_bubble_game"]["images_" + str(i)] = {
#                 "image_id": image.image_id,
#                 "image_name": image.image_name,
#                 "image_file": image.image_file,
#                 "image_description": image.image_description,
#                 "image_user_prompt": image.image_user_prompt,
#                 "image_system_prompt": image.image_system_prompt,
#                 "image_order": image.image_order,
#                 "location_id": image.location_id,
#                 "iqmap": image.iqmap,
#                 "number_of_answers_expected": image.number_of_answers_expected
#             }
#
#         # Fetch ImageBubbleGame Questions
#         cursor.execute("""
#             SELECT q.[image_id], q.[question], q.[question_type], q.[question_order], COALESCE(q.[iqmap], 'default_value') AS [iqmap]
#             FROM [t_hbb_ImageBubbleGame_questions] as q
#             JOIN t_hbb_ImageBubbleGame_images as i
#               ON q.iqmap = i.iqmap
#              AND q.listing_id = i.listing_id
#             WHERE i.listing_id = ?
#         """, listing_id)
#         bubble_game_questions = cursor.fetchall()
#         for question, i in zip(bubble_game_questions, range(len(bubble_game_questions))):
#             site_json["games"]["image_bubble_game"]["questions_" + str(i)] = {
#                 "image_id": question.image_id,
#                 "question": question.question,
#                 "question_type": question.question_type,
#                 "question_order": question.question_order,
#                 "iqmap": question.iqmap,
#                 "listing_id": listing_id
#             }
#
#         # Fetch predetermined questions
#         cursor.execute("""
#             SELECT [question_id], [listing_id], [system_prompt_text], [response_text]
#             FROM [t_hbb_predetermined_responses]
#             WHERE listing_id = ?
#         """, listing_id)
#         predetermined_questions = cursor.fetchall()
#         for question, i in zip(predetermined_questions, range(len(predetermined_questions))):
#             site_json["questions"]["predetermined_questions_" + str(i)] = {
#                 "question_id": question.question_id,
#                 "listing_id": question.listing_id,
#                 "system_prompt_text": question.system_prompt_text,
#                 "response_text": question.response_text
#             }
#
#         # Fetch site location questions
#         cursor.execute("""
#             SELECT [listing_id], [SITE_LOCATION], [quick_question], [quick_question_system_prompt], [qucik_question_order]
#             FROM [t_hbb_site_location_questions]
#             WHERE listing_id = ?
#         """, listing_id)
#         site_location_questions = cursor.fetchall()
#         for question, i in zip(site_location_questions, range(len(site_location_questions))):
#             site_json["questions"]["site_location_questions_" + str(i)] = {
#                 "listing_id": question.listing_id,
#                 "SITE_LOCATION": question.SITE_LOCATION,
#                 "quick_question": question.quick_question,
#                 "quick_question_system_prompt": question.quick_question_system_prompt,
#                 "qucik_question_order": question.qucik_question_order
#             }
#
#         # Fetch conversation topic questions
#         cursor.execute("""
#             SELECT [question_id], [listing_id], [CONVOTOP], [quick_question], [quick_question_system_prompt], [qucik_question_order]
#             FROM [t_hbb_site_convotop_questions]
#             WHERE listing_id = ?
#         """, listing_id)
#         convotop_questions = cursor.fetchall()
#         for question, i in zip(convotop_questions, range(len(convotop_questions))):
#             site_json["questions"]["conversation_topic_questions_" + str(i)] = {
#                 "question_id": question.question_id,
#                 "listing_id": question.listing_id,
#                 "CONVOTOP": question.CONVOTOP,
#                 "quick_question": question.quick_question,
#                 "quick_question_system_prompt": question.quick_question_system_prompt,
#                 "qucik_question_order": question.qucik_question_order
#             }
#
#         # Close the connection
#         cursor.close()
#         conn.close()
#
#         return site_json
#     except:
#         raise
import psycopg2
import os

# def build_site_json(listing_id):
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()
#
#         # Initialize the JSON structure
#         site_json = {
#             "listing": {},
#             "assistant": {},
#             "carousel": {},
#             "games": {
#                 "bin_game": {},
#                 "image_bubble_game": {}
#             },
#             "questions": {}
#         }
#
#         # ✅ Fetch the master_listing_id associated with the listing_id
#         cursor.execute("""
#             SELECT master_listing_id, active
#             FROM t_hbb_master_listing
#             WHERE listing_id = %s
#         """, (listing_id,))
#         master_listing_data = cursor.fetchone()
#
#         # Assign master_listing_id or None
#         if master_listing_data:
#             site_json["listing"]["master_listing_id"] = master_listing_data[0]
#             site_json["listing"]["active"] = master_listing_data[1]
#         else:
#             site_json["listing"]["master_listing_id"] = None
#             site_json["listing"]["active"] = False  # Default if no active status
#
#         # ✅ Fetch `t_hbb_listing`
#         cursor.execute("SELECT listing_id FROM t_hbb_listing WHERE listing_id = %s", (listing_id,))
#         listing_data = cursor.fetchone()
#         if listing_data:
#             site_json["listing"]["listing_id"] = listing_data[0]
#
#         # ✅ Fetch `t_hbb_listing_detail`
#         cursor.execute("""
#             SELECT listing_id, listing_image_id, listing_agent_id, listing_assistant_name,
#                    listing_description, listing_address, created_at
#             FROM t_hbb_listing_detail
#             WHERE listing_id = %s
#         """, (listing_id,))
#         listing_detail_data = cursor.fetchone()
#
#         if listing_detail_data:
#             site_json["listing"]["listing_details"] = {
#                 "listing_image_id": listing_detail_data[1],
#                 "listing_agent_id": listing_detail_data[2],
#                 "listing_assistant_name": listing_detail_data[3],
#                 "listing_description": listing_detail_data[4],
#                 "listing_address": listing_detail_data[5]
#             }
#
#         # ✅ Fetch images associated with listing
#         cursor.execute("""
#             SELECT i.image_id, i.image_file_name, i.image_url, i.image_description
#             FROM t_hbb_image AS i
#             JOIN t_hbb_listing_detail AS d ON i.image_id = d.listing_image_id
#             WHERE d.listing_id = %s
#         """, (listing_id,))
#         image_data = cursor.fetchall()
#
#         if image_data:
#             for i, img in enumerate(image_data):
#                 site_json["listing"][f"images_{i}"] = {
#                     "image_id": img[0],
#                     "image_file_name": img[1],
#                     "image_url": img[2],
#                     "image_description": img[3]
#                 }
#
#         # ✅ Fetch agent details
#         agent_id = None
#         cursor.execute("""
#             SELECT agent_id, listing_id, listing_agent_name, listing_agent_logo_id, listing_agent_description
#             FROM t_hbb_listing_agent
#             WHERE listing_id = %s
#         """, (listing_id,))
#         agent_data = cursor.fetchone()
#
#         if agent_data:
#             agent_id = agent_data[0]
#             site_json["agent"] = {
#                 "agent_id": agent_data[0],
#                 "listing_id": agent_data[1],
#                 "listing_agent_name": agent_data[2],
#                 "listing_agent_logo_id": agent_data[3],
#                 "listing_agent_description": agent_data[4]
#             }
#
#         # ✅ Fetch agent logo images
#         if agent_id:
#             cursor.execute("""
#                 SELECT listing_agent_logo_id, logo_image_id, agent_id, logo_description
#                 FROM t_hbb_listing_agent_logo
#                 WHERE agent_id = %s
#             """, (agent_id,))
#             agent_logo_data = cursor.fetchall()
#
#             for i, logo in enumerate(agent_logo_data):
#                 site_json["agent"][f"logos_{i}"] = {
#                     "listing_agent_logo_id": logo[0],
#                     "logo_image_id": logo[1],
#                     "agent_id": logo[2],
#                     "logo_description": logo[3]
#                 }
#
#         # ✅ Fetch assistant details
#         cursor.execute("""
#             SELECT listing_id, assistant_id_OAI, assistant_description
#             FROM t_hbb_listing_assistant
#             WHERE listing_id = %s
#         """, (listing_id,))
#         assistant_data = cursor.fetchone()
#
#         if assistant_data:
#             site_json["assistant"] = {
#                 "listing_id": assistant_data[0],
#                 "assistant_id_OAI": assistant_data[1],
#                 "assistant_description": assistant_data[2]
#             }
#
#         # ✅ Fetch carousel details
#         cursor.execute("""
#             SELECT listing_id, carousel_type, site_location, image_order, image_file_name,
#                    image_tile_destination, image_tile_description, image_tile_instructions,
#                    image_click_user_prompt, image_click_system_prompt
#             FROM t_hbb_site_carousel
#             WHERE listing_id = %s
#         """, (listing_id,))
#         carousel_data = cursor.fetchall()
#
#         if carousel_data:
#             site_json["carousel"] = []
#             for item in carousel_data:
#                 site_json["carousel"].append({
#                     "listing_id": item[0],
#                     "carousel_type": item[1],
#                     "site_location": item[2],
#                     "image_order": item[3],
#                     "image_file_name": item[4],
#                     "image_tile_destination": item[5],
#                     "image_tile_description": item[6],
#                     "image_tile_instructions": item[7],
#                     "image_click_user_prompt": item[8],
#                     "image_click_system_prompt": item[9]
#                 })
#
#         # ✅ Fetch BinQImageGame data
#         cursor.execute("""
#             SELECT image_id, listing_id, image_name, image_file,
#                    image_description, image_user_prompt, image_system_prompt,
#                    image_order, location_id, COALESCE(iqmap, 'default_value')
#             FROM t_hbb_BinQImageGame_images
#             WHERE listing_id = %s
#         """, (listing_id,))
#         bin_game_images = cursor.fetchall()
#
#         for i, image in enumerate(bin_game_images):
#             site_json["games"]["bin_game"][f"images_{i}"] = {
#                 "image_id": image[0],
#                 "image_name": image[2],
#                 "image_file": image[3],
#                 "image_description": image[4],
#                 "image_user_prompt": image[5],
#                 "image_system_prompt": image[6],
#                 "image_order": image[7],
#                 "location_id": image[8],
#                 "iqmap": image[9]
#             }
#
#         # ✅ Fetch predetermined questions
#         cursor.execute("""
#             SELECT question_id, listing_id, system_prompt_text, response_text
#             FROM t_hbb_predetermined_responses
#             WHERE listing_id = %s
#         """, (listing_id,))
#         predetermined_questions = cursor.fetchall()
#
#         for i, question in enumerate(predetermined_questions):
#             site_json["questions"][f"predetermined_questions_{i}"] = {
#                 "question_id": question[0],
#                 "listing_id": question[1],
#                 "system_prompt_text": question[2],
#                 "response_text": question[3]
#             }
#
#         # ✅ Fetch site location questions
#         cursor.execute("""
#             SELECT listing_id, site_location, quick_question, quick_question_system_prompt, qucik_question_order
#             FROM t_hbb_site_location_questions
#             WHERE listing_id = %s
#         """, (listing_id,))
#         site_location_questions = cursor.fetchall()
#
#         for i, question in enumerate(site_location_questions):
#             site_json["questions"][f"site_location_questions_{i}"] = {
#                 "listing_id": question[0],
#                 "site_location": question[1],
#                 "quick_question": question[2],
#                 "quick_question_system_prompt": question[3],
#                 "qucik_question_order": question[4]
#             }
#
#         return site_json
#
#     except Exception as e:
#         print(f"[ERROR] Exception in build_site_json: {e}")
#         return {}
#
#     finally:
#         cursor.close()
#         conn.close()

def build_site_json(listing_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # print('[DEBUG]: In Build Site Json')
        # Initialize the JSON structure
        site_json = {
            "listing": {},
            "assistant": {},
            "carousel": {},
            "games": {
                "bin_game": {},
                "image_bubble_game": {}
            },
            "questions": {}
        }

        # ✅ Fetch the master_listing_id associated with the listing_id
        cursor.execute("""
            SELECT master_listing_id, active 
            FROM t_hbb_master_listing 
            WHERE listing_id = %s
        """, (listing_id,))
        master_listing_data = cursor.fetchone()

        # Assign master_listing_id or None
        if master_listing_data:
            site_json["listing"]["master_listing_id"] = master_listing_data[0]
            site_json["listing"]["active"] = master_listing_data[1]
        else:
            site_json["listing"]["master_listing_id"] = None
            site_json["listing"]["active"] = False  # Default if no active status

        # ✅ Fetch `t_hbb_listing`
        # print('[DEBUG]: SELECT listing_id FROM t_hbb_listing WHERE listing_id = %s')
        cursor.execute("SELECT listing_id FROM t_hbb_listing WHERE listing_id = %s", (listing_id,))
        listing_data = cursor.fetchone()
        if listing_data:
            site_json["listing"]["listing_id"] = listing_data[0]

        # ✅ Fetch `t_hbb_listing_detail`
        cursor.execute("""
            SELECT listing_id, listing_image_id, listing_agent_id, listing_assistant_name,
                   listing_description, listing_address, created_at
            FROM t_hbb_listing_detail
            WHERE listing_id = %s
        """, (listing_id,))
        listing_detail_data = cursor.fetchone()

        if listing_detail_data:
            site_json["listing"]["listing_details"] = {
                "listing_image_id": listing_detail_data[1],
                "listing_agent_id": listing_detail_data[2],
                "listing_assistant_name": listing_detail_data[3],
                "listing_description": listing_detail_data[4],
                "listing_address": listing_detail_data[5]
            }

        # ✅ Fetch images associated with listing
        # print('[DEBUG]: SELECT i.image_id, i.image_file_name, i.image_url, i.image_description')
        cursor.execute("""
            SELECT i.image_id, i.image_file_name, i.image_url, i.image_description
            FROM t_hbb_image AS i
            JOIN t_hbb_listing_detail AS d ON i.image_id = d.listing_image_id
            WHERE d.listing_id = %s
        """, (listing_id,))
        image_data = cursor.fetchall()

        if image_data:
            for i, img in enumerate(image_data):
                site_json["listing"][f"images_{i}"] = {
                    "image_id": img[0],
                    "image_file_name": img[1],
                    "image_url": img[2],
                    "image_description": img[3]
                }




        # # ✅ Fetch agent details
        # agent_id = None
        # cursor.execute("""
        #     SELECT agent_id, listing_id, listing_agent_name, listing_agent_logo_id, listing_agent_description
        #     FROM t_hbb_listing_agent
        #     WHERE listing_id = %s
        # """, (listing_id,))
        # agent_data = cursor.fetchone()
        #
        # if agent_data:
        #     agent_id = agent_data[0]
        #     site_json["agent"] = {
        #         "agent_id": agent_data[0],
        #         "listing_id": agent_data[1],
        #         "listing_agent_name": agent_data[2],
        #         "listing_agent_logo_id": agent_data[3],
        #         "listing_agent_description": agent_data[4]
        #     }
        #
        # # ✅ Fetch agent logo images
        # if agent_id:
        #     cursor.execute("""
        #         SELECT listing_agent_logo_id, logo_image_id, agent_id, logo_description
        #         FROM t_hbb_listing_agent_logo
        #         WHERE agent_id = %s
        #     """, (agent_id,))
        #     agent_logo_data = cursor.fetchall()
        #
        #     for i, logo in enumerate(agent_logo_data):
        #         site_json["agent"][f"logos_{i}"] = {
        #             "listing_agent_logo_id": logo[0],
        #             "logo_image_id": logo[1],
        #             "agent_id": logo[2],
        #             "logo_description": logo[3]
        #         }

        # ✅ Fetch agent details
        agent_id = None
        cursor.execute("""
            SELECT agent_id, listing_id, listing_agent_name, listing_agent_logo_id, listing_agent_description
            FROM t_hbb_listing_agent 
            WHERE listing_id = %s
        """, (listing_id,))
        agent_data = cursor.fetchone()

        if agent_data:
            agent_id = agent_data[0]
            site_json["agent"] = {
                "agent_id": agent_data[0],
                "listing_id": agent_data[1],
                "listing_agent_name": agent_data[2],
                "listing_agent_logo_id": agent_data[3],
                "listing_agent_description": agent_data[4]
            }

        # ✅ Fetch agent logo images (with image details)
        if agent_id:
            cursor.execute("""
                SELECT logo.listing_agent_logo_id, 
                       logo.logo_image_id, 
                       logo.agent_id, 
                       logo.logo_description,
                       img.image_file_name,
                       img.image_url
                FROM t_hbb_listing_agent_logo AS logo
                JOIN t_hbb_image AS img ON logo.logo_image_id = img.image_id
                WHERE logo.agent_id = %s
            """, (agent_id,))
            agent_logo_data = cursor.fetchall()

            for i, logo in enumerate(agent_logo_data):
                site_json["agent"][f"logos_{i}"] = {
                    "listing_agent_logo_id": logo[0],
                    "logo_image_id": logo[1],
                    "agent_id": logo[2],
                    "logo_description": logo[3],
                    "image_file_name": logo[4],  # ✅ Added image file name
                    "image_url": logo[5]  # ✅ Added image URL
                }

        # ✅ Fetch assistant details
        cursor.execute("""
            SELECT listing_id, assistant_id_OAI, assistant_description
            FROM t_hbb_listing_assistant
            WHERE listing_id = %s
        """, (listing_id,))
        assistant_data = cursor.fetchone()

        if assistant_data:
            site_json["assistant"] = {
                "listing_id": assistant_data[0],
                "assistant_id_OAI": assistant_data[1],
                "assistant_description": assistant_data[2]
            }

        # ✅ Fetch carousel details
        cursor.execute("""
            SELECT listing_id, carousel_type, site_location, image_order, image_file_name,
                   image_tile_destination, image_tile_description, image_tile_instructions,
                   image_click_user_prompt, image_click_system_prompt
            FROM t_hbb_site_carousel
            WHERE listing_id = %s
        """, (listing_id,))
        carousel_data = cursor.fetchall()

        if carousel_data:
            site_json["carousel"] = []
            for item in carousel_data:
                site_json["carousel"].append({
                    "listing_id": item[0],
                    "carousel_type": item[1],
                    "site_location": item[2],
                    "image_order": item[3],
                    "image_file_name": item[4],
                    "image_tile_destination": item[5],
                    "image_tile_description": item[6],
                    "image_tile_instructions": item[7],
                    "image_click_user_prompt": item[8],
                    "image_click_system_prompt": item[9]
                })

        # ✅ Fetch BinQImageGame data
        cursor.execute("""
            SELECT image_id, listing_id, image_name, image_file,
                   image_description, image_user_prompt, image_system_prompt, 
                   image_order, location_id, COALESCE(iqmap, 'default_value')
            FROM t_hbb_BinQImageGame_images
            WHERE listing_id = %s
        """, (listing_id,))
        bin_game_images = cursor.fetchall()

        for i, image in enumerate(bin_game_images):
            site_json["games"]["bin_game"][f"images_{i}"] = {
                "image_id": image[0],
                "image_name": image[2],
                "image_file": image[3],
                "image_description": image[4],
                "image_user_prompt": image[5],
                "image_system_prompt": image[6],
                "image_order": image[7],
                "location_id": image[8],
                "iqmap": image[9]
            }

        # ✅ Fetch ImageBubbleGame data
        cursor.execute("""
            SELECT image_id, listing_id, image_name, image_file,
                   image_description, image_user_prompt, image_system_prompt, 
                   image_order, location_id, COALESCE(iqmap, 'default_value')
            FROM t_hbb_ImageBubbleGame_images
            WHERE listing_id = %s
        """, (listing_id,))
        bubble_game_images = cursor.fetchall()

        for i, image in enumerate(bubble_game_images):
            site_json["games"]["image_bubble_game"][f"images_{i}"] = {
                "image_id": image[0],
                "image_name": image[2],
                "image_file": image[3],
                "image_description": image[4],
                "image_user_prompt": image[5],
                "image_system_prompt": image[6],
                "image_order": image[7],
                "location_id": image[8],
                "iqmap": image[9]
            }

        # ✅ Fetch ImageBubbleGame Questions
        cursor.execute("""
            SELECT q.image_id, q.question, q.question_type, q.question_order, COALESCE(q.iqmap, 'default_value')
            FROM t_hbb_ImageBubbleGame_questions AS q
            JOIN t_hbb_ImageBubbleGame_images AS i 
              ON q.iqmap = i.iqmap
             AND q.listing_id = i.listing_id
            WHERE i.listing_id = %s
        """, (listing_id,))
        bubble_game_questions = cursor.fetchall()

        for i, question in enumerate(bubble_game_questions):
            site_json["games"]["image_bubble_game"][f"questions_{i}"] = {
                "image_id": question[0],
                "question": question[1],
                "question_type": question[2],
                "question_order": question[3],
                "iqmap": question[4],
                "listing_id": listing_id
            }

        # ✅ Fetch predetermined questions
        cursor.execute("""
            SELECT question_id, listing_id, system_prompt_text, response_text
            FROM t_hbb_predetermined_responses
            WHERE listing_id = %s
        """, (listing_id,))
        predetermined_questions = cursor.fetchall()

        for i, question in enumerate(predetermined_questions):
            site_json["questions"][f"predetermined_questions_{i}"] = {
                "question_id": question[0],
                "listing_id": question[1],
                "system_prompt_text": question[2],
                "response_text": question[3]
            }

        # ✅ Fetch site location questions
        cursor.execute("""
            SELECT listing_id, site_location, quick_question, quick_question_system_prompt, qucik_question_order
            FROM t_hbb_site_location_questions
            WHERE listing_id = %s
        """, (listing_id,))
        site_location_questions = cursor.fetchall()

        for i, question in enumerate(site_location_questions):
            site_json["questions"][f"site_location_questions_{i}"] = {
                "listing_id": question[0],
                "site_location": question[1],
                "quick_question": question[2],
                "quick_question_system_prompt": question[3],
                "qucik_question_order": question[4]
            }
        # print('[DEBUG]: Returning JSON', site_json)

        return site_json

    except Exception as e:
        print(f"[ERROR] Exception in build_site_json: {e}")
        return {}

    finally:
        cursor.close()
        conn.close()


def upsert_listing(new_site_Json, old_site_Json = None, user_id = None, rights='view'):
    # INSERT IF old_site_Json - None
    master_listing_id = new_site_Json['listing']['master_listing_id']
    listing_id = new_site_Json['listing']['listing_id']
    try:
        conn = get_db_connection()
        cursor = conn.cursor()


        # Step 3: Save the full JSON to the t_hbb_listing_json table
        listing_json_str = json.dumps(new_site_Json)  # Convert the JSON object to a string
        sql_insert_json = """
            INSERT INTO t_hbb_listing_json (listing_id, listing_json, user_id) 
            VALUES (%s, %s, %s)
        """
        cursor.execute(sql_insert_json, (listing_id, listing_json_str, user_id))
        # print(f"Saving JSON data for listing_id: {listing_id}")

        # Commit the transaction
        conn.commit()
        # print("Upsert transaction completed successfully.")



        # # SAVE JSON TO JSON LOG FIRST
        first_query = []
        query_list = []
        if old_site_Json is None:
            for k0 in new_site_Json.keys():
                if k0 == 'listing':
                    print('LISTING')
                    # print('INSERTING NEW LISTING_ID')
                    for k1 in new_site_Json[k0].keys():
                        if k1 == 'listing_id':
                            # LISTING
                            listing_dict = new_site_Json['listing']
                            sql = (
                                """
                                INSERT INTO t_hbb_listing(listing_id) 
                                VALUES(%s)
                                """)
                            first_query.append((sql, (listing_id,)))
                        elif k1 == 'listing_details':
                            # LISTING DETAILS
                            listing_details_dict = new_site_Json['listing']['listing_details']
                            # Construct the SQL query
                            sql_listing_details = (
                                """
                                INSERT INTO t_hbb_listing_detail (
                                    listing_id,
                                    listing_image_id,
                                    listing_agent_id,
                                    listing_assistant_name,
                                    listing_description,
                                    listing_address
                                )
                                VALUES (%s, %s, %s, %s, %s, %s)
                                """
                            )

                            # Execute the query with the corresponding values
                            query_list.append((sql_listing_details, (
                                listing_id,
                                listing_details_dict.get('listing_image_id', None),
                                listing_details_dict.get('listing_agent_id', None),
                                listing_details_dict.get('listing_assistant_name', None),
                                listing_details_dict.get('listing_description', None),
                                listing_details_dict.get('listing_address', None)
                            )))
                        elif k1 == 'active':
                            print('Active Status', k1)
                        elif k1 == 'master_listing_id':
                            print('master_listing_id', k1)
                        else:
                            # IMAGES
                            image_dict = new_site_Json['listing'][k1]
                            sql_image_insert = """
                                INSERT INTO t_hbb_image (
                                    image_id,
                                    image_file_name,
                                    image_url,
                                    image_description
                                ) VALUES (%s, %s, %s, %s)
                            """
                            query_list.append((
                                sql_image_insert,
                                (
                                    image_dict.get('image_id'),
                                    image_dict.get('image_file_name'),
                                    image_dict.get('image_url'),
                                    image_dict.get('image_description')
                                )
                            ))
                if k0 == 'assistant':
                    print('ASSISTANT')
                    listing_assistant_dict = new_site_Json['assistant']
                    # Create the SQL INSERT statement for `t_hbb_listing_assistant`
                    sql_assistant_insert = """
                        INSERT INTO t_hbb_listing_assistant (
                            listing_id,
                            assistant_id_OAI,
                            assistant_description
                        ) VALUES (%s, %s, %s)
                    """

                    # Store the query and its parameters in `query_list`
                    query_list.append((
                        sql_assistant_insert,
                        (
                            listing_id,
                            listing_assistant_dict.get('assistant_id_OAI'),
                            listing_assistant_dict.get('assistant_description')
                        )
                    ))
                if k0 == 'carousel' :
                    print('CAROUSEL')
                    carousel_list = new_site_Json['carousel']
                    sql_carousel_insert = """
                        INSERT INTO t_hbb_site_carousel (
                            listing_id, 
                            carousel_type, 
                            site_location, 
                            image_order, 
                            image_file_name, 
                            image_tile_destination, 
                            image_tile_description, 
                            image_tile_instructions, 
                            image_click_user_prompt, 
                            image_click_system_prompt
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """

                    # Iterate over the list of dictionaries and prepare queries
                    for carousel_dict in carousel_list:
                        # print('Carousel List Upload')
                        # Extract parameters for the query
                        params = (
                            listing_id,
                            carousel_dict.get('carousel_type'),
                            carousel_dict.get('site_location'),
                            carousel_dict.get('image_order'),
                            carousel_dict.get('image_file_name'),
                            carousel_dict.get('image_tile_destination'),
                            carousel_dict.get('image_tile_description'),
                            carousel_dict.get('image_tile_instructions'),
                            carousel_dict.get('image_click_user_prompt'),
                            carousel_dict.get('image_click_system_prompt')
                        )

                        # Append the query and params to the query list
                        query_list.append((sql_carousel_insert, params))
                if k0 == 'games':
                    print('GAMES')
                    # SQL Queries for Bin Image Game
                    bin_game_image_sql = """
                        INSERT INTO t_hbb_BinQImageGame_images
                        (iqmap, image_id, 
                        listing_id, image_name, 
                        image_file, image_description, 
                        image_user_prompt, image_system_prompt, 
                        image_order, location_id)
                        VALUES (%s, %s, 
                                %s, %s, 
                                %s, %s, 
                                %s, %s, 
                                %s, %s)
                    """

                    bin_game_question_sql = """
                        INSERT INTO t_hbb_BinQImageGame_questions
                        (iqmap, image_id, question, question_type, question_order, listing_id)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """

                    # SQL Queries for Image Bubble Game
                    image_bubble_image_sql = """
                        INSERT INTO t_hbb_ImageBubbleGame_images
                        (iqmap, image_id, 
                        listing_id, image_name, 
                        image_file, image_description, 
                        image_user_prompt, image_system_prompt, 
                        image_order, location_id, number_of_answers_expected)
                        VALUES (%s, %s, 
                                %s, %s, 
                                %s, %s, 
                                %s, %s, 
                                %s, %s, %s)
                    """

                    image_bubble_question_sql = """
                        INSERT INTO t_hbb_ImageBubbleGame_questions
                        (iqmap, image_id, question, question_type, question_order, listing_id)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """

                    # Handle Bin Image Game
                    bin_game = new_site_Json.get(k0, {}).get('bin_game', {})
                    print('BIN GAME JSON', json.dumps(bin_game, indent=4))
                    if bin_game:
                        # Process images
                        for key, jSonData in bin_game.items():
                            if 'images' in key:
                                # print(f"Processing bin game image entry: {key}, image_id: {jSonData.get('iqmap')}")

                                # Ensure 'image_id' is not None; generate if needed
                                image_id = jSonData.get('image_id') or str(uuid.uuid4())
                                iqmap = jSonData.get('iqmap') or str(uuid.uuid4())  # Ensure iqmap is present

                                params = (
                                    iqmap,  # Ensure iqmap is included
                                    image_id,
                                    listing_id,  # Listing ID
                                    jSonData.get('image_name'),
                                    jSonData.get('image_file'),
                                    jSonData.get('image_description'),
                                    jSonData.get('image_user_prompt'),
                                    jSonData.get('image_system_prompt'),
                                    jSonData.get('image_order'),
                                    jSonData.get('location_id'),
                                    # jSonData.get('number_of_questions_expected'),
                                )
                                query_list.append((bin_game_image_sql, params))

                            # Process questions
                            elif 'questions' in key:
                                print(f"Processing bin game question entry: {key}, iqmap: {jSonData.get('iqmap')}")

                                question_params = (
                                    jSonData.get('iqmap'),  # Ensure iqmap is included
                                    jSonData.get('image_id'),  # This should match the linked image_id
                                    jSonData.get('question'),
                                    jSonData.get('question_type'),
                                    jSonData.get('question_order'),
                                    listing_id
                                )
                                query_list.append((bin_game_question_sql, question_params))

                    # Handle Image Bubble Game
                    # Extracting data for image_bubble_game section
                    image_bubble_game = new_site_Json.get('games', {}).get('image_bubble_game', {})
                    # print('DEBUG', image_bubble_game)

                    if image_bubble_game:
                        # Process images
                        for key, jSonData in image_bubble_game.items():
                            if key.startswith('images_'):
                                print(f"Processing image entry: {key}, image_id: {jSonData.get('iqmap')}")

                                # Ensure 'image_id' is not None; generate if needed
                                image_id = jSonData.get('image_id') or str(uuid.uuid4())
                                iqmap = jSonData.get('iqmap') or str(uuid.uuid4())  # Ensure iqmap is present

                                params = (
                                    iqmap,  # Ensure iqmap is included
                                    image_id,
                                    listing_id,  # Listing ID
                                    jSonData.get('image_name'),
                                    jSonData.get('image_file'),
                                    jSonData.get('image_description'),
                                    jSonData.get('image_user_prompt'),
                                    jSonData.get('image_system_prompt'),
                                    jSonData.get('image_order'),
                                    jSonData.get('location_id'),
                                    jSonData.get('number_of_answers_expected')
                                )
                                query_list.append((image_bubble_image_sql, params))

                            # Process questions
                            elif key.startswith('questions_'):
                                # print(f"Processing question entry: {key}, iqmap: {jSonData.get('iqmap')}")

                                question_params = (
                                    jSonData.get('iqmap'),  # Ensure iqmap is included
                                    jSonData.get('image_id'),  # This should be the linked image_id
                                    jSonData.get('question'),
                                    jSonData.get('question_type'),
                                    jSonData.get('question_order'),
                                    listing_id
                                )
                                query_list.append((image_bubble_question_sql, question_params))

                if k0 == 'questions':
                    print('QUESTIONS')
                    # SQL Queries for each table
                    predetermined_question_sql = """
                        INSERT INTO t_hbb_predetermined_responses
                        (question_id, listing_id, system_prompt_text, response_text)
                        VALUES (%s, %s, %s, %s)
                    """

                    site_location_question_sql = """
                        INSERT INTO t_hbb_site_location_questions
                        (listing_id, SITE_LOCATION, quick_question, quick_question_system_prompt, qucik_question_order)
                        VALUES (%s, %s, %s, %s, %s)
                    """

                    conversation_topic_question_sql = """
                        INSERT INTO t_hbb_site_convotop_questions
                        (question_id, listing_id, CONVOTOP, quick_question, quick_question_system_prompt, qucik_question_order)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """

                    for key, value in new_site_Json['questions'].items():
                        if key.startswith('predetermined_questions'):
                            params = (
                                value['question_id'],
                                listing_id,
                                value['system_prompt_text'],
                                value['response_text']
                            )
                            query_list.append((predetermined_question_sql, params))

                        elif key.startswith('site_location_questions'):
                            params = (
                                listing_id,
                                value['SITE_LOCATION'],
                                value['quick_question'],
                                value['quick_question_system_prompt'],
                                value['qucik_question_order']
                            )
                            query_list.append((site_location_question_sql, params))

                        elif key.startswith('conversation_topic_questions'):
                            params = (
                                value['question_id'],
                                listing_id,
                                value['CONVOTOP'],
                                value['quick_question'],
                                value['quick_question_system_prompt'],
                                value['qucik_question_order']
                            )
                            query_list.append((conversation_topic_question_sql, params))
                if k0 == 'agent':
                    print('AGENT')
                    for k1 in new_site_Json[k0].keys():
                        if k1 == 'agent_id':
                            # LISTING
                            agent_dict = new_site_Json['agent']
                            sql = (
                                """
                                INSERT INTO t_hbb_listing_agent(agent_id, listing_id, listing_agent_name, listing_agent_logo_id, listing_agent_description) 
                                VALUES(%s, %s, %s, %s, %s)
                                """)
                            query_list.append((sql, (
                                agent_dict['agent_id'],
                                agent_dict['listing_id'],
                                agent_dict['listing_agent_name'],
                                agent_dict['listing_agent_logo_id'],
                                agent_dict['listing_agent_description'],)))
                        elif k1 == 'logos_0':
                            # LISTING DETAILS
                            logos_0_dict = new_site_Json['agent']['logos_0']
                            # Construct the SQL query
                            sql_logos_0 = (
                                """
                                INSERT INTO t_hbb_listing_agent_logo (
                                    listing_agent_logo_id,
                                    logo_image_id,
                                    agent_id,
                                    logo_description
                                )
                                VALUES (%s, %s, %s, %s)
                                """
                            )

                            # Execute the query with the corresponding values
                            query_list.append((sql_logos_0, (
                                logos_0_dict.get('listing_agent_logo_id', None),
                                logos_0_dict.get('logo_image_id', None),
                                logos_0_dict.get('agent_id', None),
                                logos_0_dict.get('logo_description', None),
                            )))
                        elif k1 == 'images_0':
                            # LISTING DETAILS
                            logo_images_0_dict = new_site_Json['agent']['images_0']
                            # Construct the SQL query
                            sql_image_insert = """
                                INSERT INTO t_hbb_image (
                                    image_id,
                                    image_file_name,
                                    image_url,
                                    image_description
                                ) VALUES (%s, %s, %s, %s)
                            """
                            query_list.append((
                                sql_image_insert,
                                (
                                    logo_images_0_dict.get('image_id'),
                                    logo_images_0_dict.get('image_file_name'),
                                    logo_images_0_dict.get('image_url'),
                                    logo_images_0_dict.get('image_description')
                                )
                            ))
                        elif k1 == 'logos_1':
                            # LISTING DETAILS
                            logos_1_dict = new_site_Json['agent']['logos_1']
                            # Construct the SQL query
                            sql_logos_1 = (
                                """
                                INSERT INTO t_hbb_listing_agent_logo (
                                    listing_agent_logo_id,
                                    logo_image_id,
                                    agent_id,
                                    logo_description
                                )
                                VALUES (%s, %s, %s, %s)
                                """
                            )

                            # Execute the query with the corresponding values
                            query_list.append((sql_logos_1, (
                                logos_1_dict.get('listing_agent_logo_id', None),
                                logos_1_dict.get('logo_image_id', None),
                                logos_1_dict.get('agent_id', None),
                                logos_1_dict.get('logo_description', None),
                            )))
                        elif k1 == 'images_1':
                            # LISTING DETAILS
                            logo_images_1_dict = new_site_Json['agent']['images_1']
                            # Construct the SQL query
                            sql_image_insert = """
                                INSERT INTO t_hbb_image (
                                    image_id,
                                    image_file_name,
                                    image_url,
                                    image_description
                                ) VALUES (%s, %s, %s, %s)
                            """
                            query_list.append((
                                sql_image_insert,
                                (
                                    logo_images_1_dict.get('image_id'),
                                    logo_images_1_dict.get('image_file_name'),
                                    logo_images_1_dict.get('image_url'),
                                    logo_images_1_dict.get('image_description')
                                )
                            ))
            for sql_query, params in first_query:
                print('Uploading Listing ID', sql_query, params)
                cursor.execute(sql_query, params)
                conn.commit()


            for sql_query, params in query_list:
                print('executing query', sql_query, params)
                cursor.execute(sql_query, params)
                conn.commit()
            print("All queries executed successfully.")

        # Step 1: Set the active listing_id to inactive for the current master_listing_id
        sql_update_active = """
            UPDATE t_hbb_master_listing
            SET active = FALSE
            WHERE master_listing_id = %s AND active = TRUE
        """
        cursor.execute(sql_update_active, (master_listing_id,))
        print(f"Deactivating all listings under master_listing_id: {master_listing_id}")

        # Step 2: Insert the new listing data into the t_hbb_master_listing table
        sql_insert_master_listing = """
            INSERT INTO t_hbb_master_listing (master_listing_id, listing_id, created_at, user_id, active)
            VALUES (%s, %s, NOW(), %s, TRUE)
        """
        cursor.execute(sql_insert_master_listing, (master_listing_id, listing_id, user_id))
        print(f"Inserting new listing with listing_id: {listing_id} under master_listing_id: {master_listing_id}")


        if user_id is not None:
            # CHECK IF THIS ENTRY EXISTS
            rights = 'admin'
            print(f"Associating listing_id: {master_listing_id} with UserID: {user_id}")
            # sql = 'SELECT user_id FROM t_hbb_user_listing3 where user_id = %s and master_listing_id = %s and rights = %s'
            sql_check = """
                SELECT user_id FROM t_hbb_user_listing3 
                WHERE user_id = %s AND master_listing_id = %s AND rights = %s
            """
            print(f"Executing SQL: {sql_check} with values: {user_id}, {master_listing_id}, {rights}")
            cursor.execute(sql_check, (user_id, master_listing_id, rights))
            query = cursor.fetchone()
            print(f"Query Result: {query}")  # This will print None if no rows are found

            if not query:
                sql = 'INSERT INTO t_hbb_user_listing3(user_id, master_listing_id, rights) VALUES(%s, %s, %s)'




        # Commit the transaction
        conn.commit()
        print("Upsert transaction completed successfully.")


        # Close the connection
        cursor.close()
        conn.close()

        return listing_id
    except Exception as e:
        # Roll back the transaction in case of error
        conn.rollback()
        print(f"An error occurred during upsert: {str(e)}")
        raise
    finally:
        # Ensure the connection is closed
        if conn:
            conn.close()


def delete_listing_data(listing_id):
    """
    Deletes all related records for a given listing ID from multiple tables.

    Args:
        listing_id (str): The listing ID to delete records for.

    Raises:
        RuntimeError: If an error occurs during the deletion process.
    """
    try:
        conn = get_db_connection()
        with conn:
            with conn.cursor() as cursor:
                # Begin transaction
                cursor.execute("BEGIN TRANSACTION;")

                # Delete images related to listing detail
                cursor.execute("""
                    DELETE i
                    FROM [t_hbb_image] as i
                    WHERE i.[image_id] IN (
                        SELECT i.[image_id]
                        FROM [t_hbb_image] as i
                        JOIN [t_hbb_listing_detail] as d ON i.image_id = d.listing_image_id
                        WHERE d.listing_id = %s
                    );
                """, (listing_id,))

                # Delete related entries from other tables in the correct order
                delete_queries = [
                    # 1. Delete from `t_hbb_listing_agent_logo` (child of `t_hbb_listing_agent`)
                    "DELETE FROM [dbo].[t_hbb_listing_agent_logo] WHERE [agent_id] IN (SELECT [agent_id] FROM [dbo].[t_hbb_listing_agent] WHERE [listing_id] = %s);",

                    # 2. Delete from `t_hbb_listing_agent`
                    "DELETE FROM [dbo].[t_hbb_listing_agent] WHERE [listing_id] = %s;",

                    # 3. Delete from `t_hbb_listing_detail`
                    "DELETE FROM [dbo].[t_hbb_listing_detail] WHERE [listing_id] = %s;",

                    # 4. Delete from `t_hbb_listing_renovations`
                    "DELETE FROM [dbo].[t_hbb_listing_renovations] WHERE [listing_id] = %s;",

                    # 5. Delete from `t_hbb_user_mortgage_data`
                    "DELETE FROM [dbo].[t_hbb_user_mortgage_data] WHERE [listing_id] = %s;",

                    # 6. Delete from `t_hbb_user_renovations`
                    "DELETE FROM [dbo].[t_hbb_user_renovations] WHERE [listing_id] = %s;",

                    # 7. Delete from `t_hbb_listing_assistant`
                    "DELETE FROM [dbo].[t_hbb_listing_assistant] WHERE [listing_id] = %s;",

                    # 8. Delete from `t_hbb_site_convotop_questions`
                    "DELETE FROM [dbo].[t_hbb_site_convotop_questions] WHERE [listing_id] = %s;",

                    # 9. Delete from `t_hbb_site_location_questions`
                    "DELETE FROM [dbo].[t_hbb_site_location_questions] WHERE [listing_id] = %s;",

                    # 10. Delete from `t_hbb_site_carousel`
                    "DELETE FROM [dbo].[t_hbb_site_carousel] WHERE [listing_id] = %s;",

                    # 11. Delete from `t_hbb_ImageBubbleGame_questions`
                    """
                    DELETE FROM [dbo].[t_hbb_ImageBubbleGame_questions]
                    WHERE [image_id] IN (
                        SELECT [image_id] FROM [dbo].[t_hbb_ImageBubbleGame_images] WHERE [listing_id] = %s
                    );
                    """,

                    # 12. Delete from `t_hbb_ImageBubbleGame_images`
                    "DELETE FROM [dbo].[t_hbb_ImageBubbleGame_images] WHERE [listing_id] = %s;",

                    # 13. Delete from `t_hbb_BinQImageGame_questions`
                    """
                    DELETE FROM [dbo].[t_hbb_BinQImageGame_questions]
                    WHERE [image_id] IN (
                        SELECT [image_id] FROM [dbo].[t_hbb_BinQImageGame_images] WHERE [listing_id] = %s
                    );
                    """,

                    # 14. Delete from `t_hbb_BinQImageGame_images`
                    "DELETE FROM [dbo].[t_hbb_BinQImageGame_images] WHERE [listing_id] = %s;",

                    # 15. Delete from `t_hbb_predetermined_responses`
                    "DELETE FROM [dbo].[t_hbb_predetermined_responses] WHERE [listing_id] = %s;",

                    # 16. Delete from `t_hbb_agent_listing`
                    "DELETE FROM [dbo].[t_hbb_agent_listing] WHERE [listing_id] = %s;",

                    # 17. Delete from `t_hbb_listing` (main entry)
                    "DELETE FROM [dbo].[t_hbb_listing] WHERE [listing_id] = %s;"
                ]

                # Execute each delete query in order with the listing_id as a parameter
                for query in delete_queries:
                    cursor.execute(query, (listing_id,))

                # Commit the transaction
                cursor.execute("COMMIT;")

                print(f"All related records for listing ID '{listing_id}' have been successfully deleted.")

    except Exception as e:
        print(f"Error deleting records for listing ID {listing_id}: {e}")
        raise RuntimeError(f"Failed to delete records for listing ID {listing_id}: {e}")
