import React, { useEffect, useState } from "react";

interface Wine {
    id: number,
    name: string,
    year: number,
    varietal:string,
    region:string,
    status:string

}


function WineList() {
    const [wines, setWines] = useState<Wine[]>([]);
    const [loading,setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/wines')
        .then(res => res.json())
        .then(data => {
            setWines(data);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch wines', err)
            setLoading(false);
        });
    });

    if (loading) return <p>Loading Wines...</p>;

    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Varietal</th>
                    <th>Region</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {wines.map(wine => (
                    <tr key={wine.id}>
                        <td>{wine.name}</td>
                        <td>{wine.year}</td>
                        <td>{wine.varietal}</td>
                        <td>{wine.region}</td>
                        <td>{wine.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>

    );

}

export default WineList;