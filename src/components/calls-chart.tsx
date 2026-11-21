import { ChartDecreaseIcon, ChartIncreaseIcon } from "hugeicons-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const data = [
  { day: "Mon", calls: 139 },
  { day: "Tue", calls: 175 },
  { day: "Wed", calls: 239 },
  { day: "Thu", calls: 216 },
  { day: "Fri", calls: 296 },
  { day: "Sat", calls: 74 },
  { day: "Sun", calls: 145 },
]

const chartConfig = {
  calls: {
    label: "Calls",
    color: "var(--foreground)",
  },
} satisfies ChartConfig

const average = data.reduce((sum, d) => sum + d.calls, 0) / data.length
const latest = data[data.length - 1].calls
const changePct = Math.round(((latest - average) / average) * 100)
const isUp = changePct >= 0

export function CallsChart() {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Calls per day</CardTitle>
        <CardDescription className="text-[12px]">
          Last 7 days, all apps
        </CardDescription>
        <CardAction>
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
            7d
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="calls" fill="var(--color-calls)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 px-4 text-[12.5px]">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending {isUp ? "up" : "down"} by {Math.abs(changePct)}% today{" "}
          {isUp ? (
            <ChartIncreaseIcon className="size-4" />
          ) : (
            <ChartDecreaseIcon className="size-4" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Compared to the 7-day average
        </div>
      </CardFooter>
    </Card>
  )
}
