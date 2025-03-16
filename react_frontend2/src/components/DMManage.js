import React from 'react';
import { Link } from 'react-router-dom';

const DMManage = () => {
    return (
        <div>
            <h1>Home</h1>
            <ul>
                <li><Link to="/agent/agent_1">Agent 1</Link></li>
                <li><Link to="/agent/agent_2">Agent 2</Link></li>
                <li><Link to="/client/user_1/listing_1/agent_1">Client 1 at Listing 1 with Agent 1</Link></li>
                <li><Link to="/client/user_2/listing_2/agent_1">Client 2 at Listing 2 with Agent 1</Link></li>
                <li><Link to="/client/user_3/listing_3/agent_2">Client 3 at Listing 3 with Agent 2</Link></li>
            </ul>
        </div>
    );
};

export default DMManage;
