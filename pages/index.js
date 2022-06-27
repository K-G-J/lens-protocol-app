import { useState, useEffect } from 'react'
import {
  client,
  recommendProfiles,
  getPublications,
  searchProfiles,
} from '../api'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [profiles, setProfiles] = useState([])
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    try {
      const response = await client.query(recommendProfiles).toPromise()
      const profileData = await Promise.all(
        response.data.reccomendedProfiles.map(async (profile) => {
          const pub = await client
            .query(getPublications, { id: profile.id, limit: 10 })
            .toPromise()
          profile.publication = pub.data.pubblications.items[0]
          return profile
        }),
      )
      setProfiles(profileData)
    } catch (err) {
      console.log('error fetching reccomended profiles: ', err)
    }
  }

  async function searchForProfile() {
    try {
      const response = await client
        .query(searchProfiles, {
          query: searchString,
          type: 'PROFILE',
        })
        .toPromise()
      const profileData = await Promise.all(
        response.data.search.items.map(async (profile) => {
          const pub = await client
            .query(getPublications, { id: profile.profileId, limit: 1 })
            .toPromise()
          profile.id = profile.profileId
          profile.publication = pub.data.publications.items[0]
          return profile
        }),
      )
      setProfiles(profileData)
    } catch (err) {
      console.log('error searching proffiles...', err)
    }
  }
  return (
    <div>
      <input
        placeholder="Search"
        onChange={(e) => setSearchString(e.target.value)}
        value={searchString}
      />
      <button onClick={searchForProfile}>SEARCH PROFILES</button>
      <div>
        {profiles.map((profile, index) => (
          <Link href={`/profile/${profile.id}`} key={index}>
            <a>
              {profile.picture ? (
                <Image
                  src={profile.picture.original.url}
                  width="52px"
                  height="52px"
                />
              ) : (
                <div style={blankPhotoStyle} />
              )}
              <p>{profile.handle}</p>
              <p>{profile.publication?.metadata.content}</p>
            </a>
          </Link>
        ))}
      </div>
    </div>
  )
}

const blankPhotoStyle = {
  width: '52px',
  height: '52px',
  backgroundColor: 'black',
}
