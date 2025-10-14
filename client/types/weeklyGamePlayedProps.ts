export type WeeklyGameData = {
    labels: string[]
    counts: number[]
    weekLabel: string
    range?: { start: string; end: string }
    offSet?: number
}