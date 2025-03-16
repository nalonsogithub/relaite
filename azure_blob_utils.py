from dotenv import load_dotenv
load_dotenv()
# azure_blob_utils.py
from azure.storage.blob import BlobServiceClient
import os


# Set up your Azure Storage Account details
BLOB_CONTAINER = os.getenv("BLOB_CONTAINER")
print('BLOB_CONTAINER', BLOB_CONTAINER)
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
print('AZURE_STORAGE_CONNECTION_STRING', AZURE_STORAGE_CONNECTION_STRING)
AZURE_CONTAINER_NAME = BLOB_CONTAINER

# Initialize the BlobServiceClient - Here
blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)


def return_blob_base_listing_url(listing_id):
    blob_path = f"{os.getenv('IMAGE_URL')}{listing_id}"
    return blob_path
def blob_upload(file, filename, listing_id):
    """
    Upload a file to Azure Blob Storage.
    """
    try:
        blob_path = f"{listing_id}/{filename}"

        # Upload file to the specified container
        blob_client = container_client.get_blob_client(blob=blob_path)
        print('BLOB UPLOAD uploading file', blob_path)

        # Check if the blob already exists
        if blob_client.exists():
            print(f"Blob '{blob_path}' already exists. Skipping upload.")
            return blob_client.url

        blob_client.upload_blob(file)
        return blob_client.url
    except Exception as e:
        raise RuntimeError(f"Failed to upload {filename}: {str(e)}")

def blob_delete(filename):
    """
    Delete a specific file from Azure Blob Storage.
    """
    try:
        # Get a reference to the blob and delete it
        blob_client = container_client.get_blob_client(blob=filename)
        blob_client.delete_blob()
        return f"Blob '{filename}' deleted successfully."
    except Exception as e:
        raise RuntimeError(f"Failed to delete {filename}: {str(e)}")


def blob_delete_by_prefix(prefix):
    """
    Delete blobs in Azure Blob Storage that match a given prefix (wildcard).

    Args:
        prefix (str): The prefix (e.g., "folder/subfolder/") or wildcard pattern to match.

    Returns:
        List of deleted blob names or an error message.
    """
    try:
        # List blobs that start with the given prefix
        blobs_to_delete = container_client.list_blobs(name_starts_with=prefix)
        deleted_blobs = []
        print('DEBUG: BLOBS TO DELETE PREFIX', prefix, 'BLOBS', blobs_to_delete)

        # Iterate over the listed blobs and delete each one
        for blob in blobs_to_delete:
            blob_client = container_client.get_blob_client(blob.name)
            blob_client.delete_blob()
            deleted_blobs.append(blob.name)
            print(f"Deleted blob: {blob.name}")

        if not deleted_blobs:
            return f"No blobs found with the prefix '{prefix}'."
        else:
            return f"Successfully deleted {len(deleted_blobs)} blobs matching the prefix '{prefix}'."
    except Exception as e:
        raise RuntimeError(f"Failed to delete blobs with prefix '{prefix}': {str(e)}")


def blob_list():
    """
    List all blobs in the Azure Blob Storage container.
    """
    try:
        # List all blobs in the container
        blob_list = container_client.list_blobs()
        return [blob.name for blob in blob_list]
    except Exception as e:
        raise RuntimeError(f"Failed to list blobs: {str(e)}")