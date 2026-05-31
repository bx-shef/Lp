interface ContribDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ContribResponse {
  days: ContribDay[]
  total: number
}

const GITHUB_LOGIN = 'IgorShevchik'

const LEVEL_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4
}

const GQL = `{
  user(login:"${GITHUB_LOGIN}"){
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
      errors?: { message: string }[]
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
        } | null
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

    // GitHub GraphQL отдаёт ошибки (rate limit, невалидный токен) как HTTP 200
    // с телом { errors:[...], data:null } — без этого лога в ночном прогоне
    // была бы видна лишь причина-следствие «null user» без первопричины.
    if (res.errors?.length) {
      console.warn('[github-contrib] GraphQL errors:', res.errors)
    }

    if (!res.data?.user) {
      console.warn(`[github-contrib] GitHub API returned null user for login "${GITHUB_LOGIN}"`)
      return { days: [], total: 0 }
    }

    const cal = res.data.user.contributionsCollection.contributionCalendar
    const days: ContribDay[] = cal.weeks.flatMap(w =>
      w.contributionDays.map(d => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVEL_MAP[d.contributionLevel] ?? 0
      }))
    )

    return { days, total: cal.totalContributions }
  } catch (err) {
    console.warn('[github-contrib] Failed to fetch GitHub contributions:', err)
    return { days: [], total: 0 }
  }
})
