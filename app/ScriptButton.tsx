"use client"
import Image from 'next/image';
import React, { useState } from 'react';

export default function ScriptButton() {
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to find duplicate matches within a given time window
  const findDuplicateMatches = (matches: any[], maxHours = 10) => {
    const timeWindow = maxHours * 3600; // Convert hours to seconds

    // Create a set of matches with sorted team names and timestamps
    const matchSet = new Set();
    for (const match of matches) {
      const players = [match.homeTeam.name, match.awayTeam.name].sort().join(' vs ');
      const timestamp = match.startTimestamp;
      matchSet.add(`${players}|${timestamp}`);
    }

    // Convert the set to an array and sort by timestamp
    const matchList = Array.from(matchSet)
      .map((entry: any) => {
        const [players, timestamp] = entry.split('|');
        return { players, timestamp: parseInt(timestamp) };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // Find duplicate matches within the time window
    const duplicateMatches = [];
    for (let i = 0; i < matchList.length; i++) {
      for (let j = i + 1; j < matchList.length; j++) {
        if (matchList[i].players === matchList[j].players) { // Same pair of teams
          const timeDiff = Math.abs(matchList[j].timestamp - matchList[i].timestamp);
          if (timeDiff <= timeWindow) {
            duplicateMatches.push([matchList[i], matchList[j]]);
          }
        }
      }
    }

    return duplicateMatches;
  };

  // Function to fetch matches from the API
  const fetchMatches = async () => {
    let allMatches: any[] = [];
    let counter = 0;
    while (true) {
      try {
        const response = await fetch(
          `https://www.sofascore.com/api/v1/unique-tournament/19041/events/next/${counter}`
        );
        const fetchedData = await response.json()
        console.log(fetchedData)
        const matches = fetchedData.events;
        allMatches = allMatches.concat(matches);

        if (!fetchedData.hasNextPage) {
          break;
        }
        counter++;
      } catch (error) {
        console.error('Error fetching matches:', error);
        break;
      }
    }
    return allMatches;
  };

  // Handle button click
  const handleClick = async () => {
    setLoading(true);
    const allMatches = await fetchMatches();
    const duplicates = findDuplicateMatches(allMatches);
    setDuplicates(duplicates);
    setLoading(false);
  };


  return (
    <>
      <button
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        onClick={handleClick}
        disabled={loading}
      >
        <Image
          className="dark:invert"
          src="/magnifying-glass.svg"
          alt="Search-icon"
          width={20}
          height={20}
        />
        {loading ? 'Loading...' : 'Search for games'}
      </button>
      {duplicates.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Duplicate Matches - in AEST:</h2>
          <ul>
            {duplicates.map(([match1, match2], index) => {
              const time1 = new Date(match1.timestamp * 1000).toLocaleString('en-AU', {
                timeZone: 'Australia/Sydney',
                dateStyle: 'medium',
                timeStyle: 'medium',
              });
              const time2 = new Date(match2.timestamp * 1000).toLocaleString('en-AU', {
                timeZone: 'Australia/Sydney',
                dateStyle: 'medium',
                timeStyle: 'medium',
              });
              return (
                <li key={index}>
                  <strong>{match1.players}</strong> at {time1} and {time2}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  )
};