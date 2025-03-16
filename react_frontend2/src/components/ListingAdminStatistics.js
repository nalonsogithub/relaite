import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styles from '../styles/ListingAdminStatistics.module.css'; // Create CSS for styling
import { ListingAdminContext } from '../contexts/ListingAdminContext';

const ListingAdminStatistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { listingJson } = useContext(ListingAdminContext);

    // Dynamically set master_listing_id from listingJson
    const masterListingId = listingJson?.listing?.master_listing_id;

    // Define the base URL based on the current environment
    const baseUrl = (() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost') {
            return 'http://localhost:5000/api';
        } else if (hostname === 'www.aigentTechnologies.com') {
            return 'https://www.aigentTechnologies.com/api';
        } else if (hostname === 'www.openhouseaigent.com') {
            return 'https://www.openhouseaigent.com/api';
        } else {
            return 'https://hbb-zzz.azurewebsites.net/api'; // Default URL if no match
        }
    })();

    useEffect(() => {
        if (!masterListingId) {
            setError('Master Listing ID not found.');
            setLoading(false);
            return;
        }

        const fetchStatistics = async () => {
            try {
                const response = await axios.get(`${baseUrl}/get_statistics`, {
                    params: { master_listing_id: masterListingId },
                });
                setStats(response.data);
            } catch (err) {
                setError(err.message || 'Error fetching statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [masterListingId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.statisticsContainer}>
            <h2>Statistics for Master Listing ID: {masterListingId}</h2>

            <div className={styles.statCard}>
                <h3>Total Visitors</h3>
                <p>{stats.visitor_count}</p>
            </div>

            {/* Frequency of Answers */}
            {stats.frequency_data && Array.isArray(stats.frequency_data) && stats.frequency_data.length > 0 ? (
                <div className={styles.statCard}>
                    <h3>Frequency of Answers</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Frequency</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.frequency_data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.question}</td>
                                    <td>{item.frequency}</td>
                                    <td>{item.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.statCard}>
                    <h3>Frequency of Answers</h3>
                    <p>No data available.</p>
                </div>
            )}

            {/* Add other statistics similarly */}
        </div>
    );
};

export default ListingAdminStatistics;
