import React from "react";
import { scaleTime, scaleLinear, ScaleTime } from "d3-scale";
import { min, max } from "d3-array";
import { line, curveMonotoneX } from "d3-shape";
import { select } from "d3-selection";
import { axisBottom, axisLeft } from "d3-axis";
import { Delaunay } from "d3-delaunay";

import { InjectedProps } from "./withMeasureAndRender";
import { DailyRank } from "../models/ranking-data";
import dayjs from "dayjs";

type DailyRankChartProps = {
  inputData: DailyRank[];
};

const drawBackgroundRect = (x1: number, x2: number, height: number): string => {
  return `M${x1},0 L${x2},0 L${x2},${height} ${x1},${height}Z`;
};

const monthBackgroundRects = (
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
  scaleX: ScaleTime<number, number>,
  height: number
): string[] => {
  let bgRects = [];
  let cur = start;
  while (cur.isBefore(end)) {
    const endOfMonth = cur.endOf("month");
    const firstOfNextMonth = endOfMonth.add(1, "day");
    let x1: number;
    let x2: number;
    if (endOfMonth.isAfter(end)) {
      x1 = scaleX(cur.toDate());
      x2 = scaleX(end.toDate());
    } else {
      x1 = scaleX(cur.toDate());
      x2 = scaleX(firstOfNextMonth.toDate());
    }
    const r = drawBackgroundRect(x1, x2, height);
    bgRects.push(r);

    cur = firstOfNextMonth;
  }
  return bgRects;
};

const generateDayTickValues = (
  start: dayjs.Dayjs,
  end: dayjs.Dayjs
): dayjs.Dayjs[] => {
  const results: dayjs.Dayjs[] = [];
  let cur = end;
  while (start.isBefore(cur)) {
    results.push(dayjs(cur));
    cur = cur.add(-7, "day");
  }
  return results;
};

function DailyRankChart({
  inputData,
  width,
  height
}: DailyRankChartProps & InjectedProps) {
  const getX = (item: DailyRank) => item.day;
  const getY = (item: DailyRank) => item.rank;

  const margin = { top: 20, right: 20, bottom: 40, left: 45 };
  const w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  if (0 < inputData.length) {
    const data = inputData.sort((a, b) => (a.day.isBefore(b.day) ? -1 : 1));

    const start = data[0].day;
    const end = data[data.length - 1].day;

    const x = scaleTime()
      .range([0, w])
      .domain([start, end]);

    const minY = min(data, getY) || 0;
    const maxY = max(data, getY) || 0;
    const upperMargin = 3;
    const lowerMargin = 10;
    const y = scaleLinear()
      .range([h, 0])
      .domain([maxY + lowerMargin, Math.max(0, minY - upperMargin)])
      .nice();

    const valueLine = line()
      .x((d: any) => x(getX(d)))
      .y((d: any) => y(getY(d)))
      .curve(curveMonotoneX);

    const dayTickValues = generateDayTickValues(start, end).map(day =>
      day.toDate()
    );

    // setup axis
    const numOfYAxis = 5;

    const axisX = axisBottom(x)
      .tickValues(dayTickValues)
      .tickFormat(date => dayjs(date as Date).format("MMM DD"))
      .tickSizeInner(0)
      .tickPadding(8);

    const axisY = axisLeft(y).ticks(numOfYAxis);

    const horizontalLines = axisLeft(y)
      .ticks(numOfYAxis)
      .tickSize(-w)
      .tickFormat(() => "");

    // create month-background rect
    const bgRects = monthBackgroundRects(start, end, x, h);

    const points = data.map(({ day, rank }) => {
      return [x(day), y(rank)];
    });
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, w, h]);
    const cellPolygons = voronoi.cellPolygons();

    return (
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <g className="month-bg">
            {bgRects.map((d, i) => (
              <path key={`${i}`} d={d} />
            ))}
          </g>
          <g
            className="grid h-grid"
            ref={node => {
              const hGrid = select(node);
              hGrid
                .call(horizontalLines as any)
                .select(".domain")
                .remove();
              hGrid.selectAll(".tick line").attr("stroke", "#e1e1e1");
              return hGrid;
            }}
          />
          <g
            className="axis axis-x"
            transform={`translate(0, ${h})`}
            ref={node =>
              select(node)
                .call(axisX as any)
                .select(".domain")
                .remove()
            }
          />
          <g
            className="axis axis-y"
            ref={node => {
              const yAxis = select(node);
              yAxis
                .call(axisY as any)
                .select(".domain")
                .remove();
              yAxis.selectAll(".tick line").remove();
              return yAxis;
            }}
          />
          <path className="line" d={valueLine(data as any) || ``} />
          <g className="voronoi">
            {Array.from(cellPolygons).map((polygon, i) => {
              const pathData = `M${polygon
                .map(([x, y]) => `${x},${y}`)
                .join("L")}Z`;
              return <path d={pathData} key={`${i}`} />;
            })}
          </g>
        </g>
        <style jsx>
          {`
            .line {
              fill: none;
              stroke: #1c9099;
              stroke-width: 2;
            }
            .axis {
              color: #676767;
            }
            .month-bg path:nth-child(even) {
              fill: #fcfdff;
              stroke: none;
            }
            .month-bg path:nth-child(odd) {
              fill: #f2f4f7;
              stroke: none;
            }
            .voronoi {
              fill: none;
              stroke: red;
            }
          `}
        </style>
      </svg>
    );
  }
  return <svg width={width} height={height} />;
}

export default DailyRankChart;
