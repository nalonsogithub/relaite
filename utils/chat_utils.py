import re
import time

def stream_simulation():
    # Simulated content to stream (appears in chunks)
    content = [
        "This is the beginning of the response. ",
        "Here is some JSON: ```json ",
        "{'example': 1} ",
        "``` and this is the rest of the response.",
        " More data follows after the JSON block."
    ]

    buffer = ""  # Temporary buffer for chunks
    is_json = False  # Flag to track JSON sections
    json_start_regex = re.compile(r"```json")
    json_end_regex = re.compile(r"```")

    def simulate_stream(content):
        """Simulate streaming content in chunks."""
        for chunk in content:
            # Simulate a small delay to mimic streaming
            time.sleep(0.5)
            yield chunk

    # Process the simulated stream
    for chunk in simulate_stream(content):
        buffer += chunk  # Collect chunks in the buffer

        # Check for the start of a JSON block
        if not is_json and json_start_regex.search(buffer):
            is_json = True  # Start buffering JSON
            pre_json, buffer = buffer.split("```json", 1)
            print(pre_json, end="", flush=True)  # Stream content before JSON
            buffer = buffer.strip()  # Strip whitespace

        # If in JSON block, check for its end
        if is_json and json_end_regex.search(buffer):
            is_json = False  # JSON block ends
            buffer, post_json = buffer.split("```", 1)
            print(f"\nExtracted JSON Content: {buffer.strip()}", flush=True)  # Log JSON content
            buffer = post_json.strip()  # Prepare remaining content

        # If not in a JSON block, stream the content
        if not is_json and buffer:
            print(buffer, end="", flush=True)
            buffer = ""  # Clear the buffer after streaming

    # Stream any remaining content
    if buffer:
        print(buffer, end="", flush=True)

# Run the test function
stream_simulation()
