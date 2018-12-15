import React from "react";
import dayjs from "dayjs";

import ExampleBarChart from "./ExampleBarChart";
import DonutChart from "./DonutChart";
import TimeSeriesChart from "./TimeSeriesChart";
import MultiTimeSeriesChart from "./MultiTimeSeriesChart";
import DailyRankChart from "./DailyRankChart";
import ResponsiveDailyRankChart from "./ResponsiveDailyRankChart";
import withMeasureAndRender from "./withMeasureAndRender";
import {
  timeSeriesInputData,
  donutInputData,
  dailyRankingData,
  multiTimeSeriesInputData
} from "../mock-data";

const MeasuredTimeSeriesChart = withMeasureAndRender(TimeSeriesChart);
const MeasuredMultiTimeSeriesChart = withMeasureAndRender(MultiTimeSeriesChart);
const MeasuredDonutChart = withMeasureAndRender(DonutChart);
const MeasuredDailyRankChart = withMeasureAndRender(DailyRankChart);
const MeasuredResponsiveDailyRankChart = withMeasureAndRender(
  ResponsiveDailyRankChart
);

class App extends React.Component<{}, {}> {
  render() {
    return (
      <main>
        <h1>React + D3 Examples</h1>
        <ExampleBarChart />
        <div style={{ width: "100%", height: "240px" }}>
          <MeasuredResponsiveDailyRankChart inputData={dailyRankingData} />
        </div>
        <div style={{ width: "100%", height: "240px" }}>
          <MeasuredDailyRankChart inputData={dailyRankingData} />
        </div>
        <div style={{ width: "100%", height: "240px" }}>
          <MeasuredTimeSeriesChart
            inputData={timeSeriesInputData}
            getX={item => dayjs(item.time).toDate()}
            getY={item => item.km}
            formatX={date => dayjs(date).format("MMM DD")}
          />
        </div>
        <div style={{ width: "100%", height: "240px" }}>
          <MeasuredMultiTimeSeriesChart
            mutiInputData={multiTimeSeriesInputData}
          />
        </div>
        <div style={{ width: "50vw", height: "50vw" }}>
          <MeasuredDonutChart
            inputData={donutInputData}
            getX={item => item.gender}
            getY={item => item.ratio}
          />
        </div>
        <style jsx global>{`
          html,
          body {
            margin: 0;
            padding: 0;
          }
          body {
            font-family: system-ui;
          }
          main {
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 960px;
            margin: 0 auto;
          }
        `}</style>
      </main>
    );
  }
}

export default App;
