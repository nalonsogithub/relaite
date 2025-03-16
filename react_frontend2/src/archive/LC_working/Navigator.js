import React from 'react';
import { Link } from 'react-router-dom';

const Navigator = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/client">Client 1 (Listing 1)</Link>
                </li>
                <li>
                    <Link to="/agent">Agent</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navigator;
