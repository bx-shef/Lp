interface ContribDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ContribResponse {
  days: ContribDay[]
  total: number
}

const LEVEL_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4
}

const GQL = `{
  user(login:"IgorShevchik"){
    contributionsCollection{
      contributionCalendar{
        totalContributions
        weeks{
          contributionDays{
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`

export default defineEventHandler(async (): Promise<ContribResponse> => {
  const token = process.env.GITHUB_TOKEN
  if (!token) return { days: [], total: 0 }

  try {
    const res = await $fetch<{
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: number
              weeks: {
                contributionDays: {
                  date: string
                  contributionCount: number
                  contributionLevel: string
                }[]
              }[]
            }
          }
        }
      }
    }>('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: GQL }),
      timeout: 10000
    })

    const cal = res.data.user.contributionsCollection.contributionCalendar
    const days: ContribDay[] = cal.weeks.flatMap(w =>
      w.contributionDays.map(d => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVEL_MAP[d.contributionLevel] ?? 0
      }))
    )

    return { days, total: cal.totalContributions }
  } catch {
    return { days: [], total: 0 }
  }
})
