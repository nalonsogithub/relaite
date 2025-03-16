import eventlet
eventlet.monkey_patch()

from flask import Flask, request, send_from_directory
from flask_socketio import SocketIO, join_room, leave_room, emit

app = Flask(__name__, static_folder='react_frontend2/build', static_url_path='/')
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Hardcoded values for the example
AGENT_ID = 'agent_1'
USER_ID = 'user_1'
LISTING_ID = 'listing_1'
AGENT_LISTINGS = ['listing_1', 'listing_2']

@app.route('/')
@app.route('/client')
@app.route('/agent')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@socketio.on('connect')
def handle_connect():
    user_id = request.args.get('user_id')
    role = request.args.get('role')
    listing_id = request.args.get('listing_id')

    print(f'CONNECT: user_id={user_id}, role={role}, listing_id={listing_id}')

    if not user_id or not role:
        print('ERROR: Missing user_id or role in connection request')
        return

    if role == 'user' and listing_id:
        join_room(f"{listing_id}_{user_id}")
        print(f'User {user_id} joined room {listing_id}_{user_id}')
    elif role == 'agent':
        emit('relevant_chat_rooms', [{'listing_id': lid} for lid in AGENT_LISTINGS], room=request.sid)
        for lid in AGENT_LISTINGS:
            join_room(f"{lid}_agent")
            print(f'Agent {user_id} joined room {lid}_agent')

@socketio.on('disconnect')
def handle_disconnect():
    user_id = request.args.get('user_id')
    role = request.args.get('role')
    listing_id = request.args.get('listing_id')

    print(f'DISCONNECT: user_id={user_id}, role={role}, listing_id={listing_id}')

    if not user_id or not role:
        print('DEBUG: (not user_id or not role)', True)
        return

    if role == 'user' and listing_id:
        leave_room(f"{listing_id}_{user_id}")
        print(f'User {user_id} left room {listing_id}_{user_id}')
    elif role == 'agent':
        for lid in AGENT_LISTINGS:
            leave_room(f"{lid}_agent")
            print(f'Agent {user_id} left room {lid}_agent')

@socketio.on('initiate_chat')
def handle_initiate_chat(data):
    user_id = data['user_id']
    listing_id = data['listing_id']

    print(f'Chat initiation: user_id={user_id}, listing_id={listing_id}')
    private_room = f"{listing_id}_{user_id}"
    print(f'Emitting chat_request to room {listing_id}_agent')
    emit('chat_request', {'user_id': user_id, 'listing_id': listing_id}, room=f"{listing_id}_agent")
    join_room(private_room)
    print(f'User {user_id} joined room {private_room}')

@socketio.on('join_private_room')
def handle_join_private_room(data):
    agent_id = data['agent_id']
    user_id = data['user_id']
    listing_id = data['listing_id']
    private_room = f"{listing_id}_{user_id}"
    join_room(private_room)
    print(f'Agent {agent_id} joined room {private_room}')

@socketio.on('private_message')
def handle_private_message(data):
    print('PRIVATE MESSAGE RECEIVED:', data)
    if 'user_id' not in data or 'listing_id' not in data:
        print('ERROR: Missing user_id or listing_id in data')
        return

    private_room = f"{data['listing_id']}_{data['user_id']}"
    emit('private_message', data, room=private_room)
    print(f'Private message emitted for room {private_room}: {data}')

if __name__ == '__main__':
    socketio.run(app, debug=True)
