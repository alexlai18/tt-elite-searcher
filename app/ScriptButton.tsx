"use client"
import Image from 'next/image';
import React, { useState } from 'react';

interface DuplicateMatches {
  players: string,
  timestamp: number,
  slug: string,
  customId: string
}

export default function ScriptButton() {
  const [duplicates, setDuplicates] = useState<DuplicateMatches[][]>([]);
  const [loading, setLoading] = useState(false);

  // Function to find duplicate matches within a given time window
  const findDuplicateMatches = (matches: any[], maxHours = 10) => {
    const timeWindow = maxHours * 3600; // Convert hours to seconds

    // Create a set of matches with sorted team names and timestamps
    const matchSet = new Set<string>();
    for (const match of matches) {
      const players = [match.homeTeam.name, match.awayTeam.name].sort().join(' vs ');
      const timestamp = match.startTimestamp;
      const customId = match.customId;
      const slug = match.slug;
      matchSet.add(`${players}|${timestamp}|${slug}|${customId}`);
    }

    // Convert the set to an array and sort by timestamp
    const matchList = Array.from(matchSet)
      .map((entry: string) => {
        const [players, timestamp, slug, customId] = entry.split('|');
        return { players, timestamp: parseInt(timestamp), slug, customId };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // Find duplicate matches within the time window
    const duplicateMatches = [];
    for (let i = 0; i < matchList.length; i++) {
      for (let j = i + 1; j < matchList.length; j++) {
        if (matchList[i].players === matchList[j].players) { // Same pair of teams
          const timeDiff = Math.abs(matchList[j].timestamp - matchList[i].timestamp);
          if (timeDiff <= timeWindow) {
            const now = Date.now() / 1000;
            if (matchList[i].timestamp < now && matchList[j].timestamp < now) {
              continue;
            }
            duplicateMatches.push([matchList[i], matchList[j]]);
          }
        }
      }
    }

    return duplicateMatches;
  };

  // Function to fetch matches from the API
  const fetchMatches = async () => {
    const [futureMatches, pastMatches] = await Promise.all([fetchFuture(), fetchPast()]);
    const allMatches = futureMatches.concat(pastMatches);
    return allMatches;
  };

  const fetchFuture = async () => {
    let allMatches: any[] = [];
    let counter = 0;
    while (true) {
      try {
        const response = await fetch(
          `https://www.sofascore.com/api/v1/unique-tournament/19041/events/next/${counter}`
        );
        const fetchedData = await response.json()
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
  }

  const fetchPast = async () => {
    let allMatches: any[] = [];
    let counter = 0;
    for (let i = 0; i < 4; i += 1) {
      try {
        const response = await fetch(
          `https://www.sofascore.com/api/v1/unique-tournament/19041/events/last/${counter}`
        );
        const fetchedData = await response.json()
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
  }



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
                  <strong>
                    <a
                      href={`https://www.sofascore.com/table-tennis/match/${match1.slug}/${match1.customId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {match1.players}
                    </a>
                  </strong> at {time2}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  )
};
