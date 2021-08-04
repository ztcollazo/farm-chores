import * as React from "react";
import Card from "./Card";
import Calendar from "@ericz1803/react-google-calendar";
import { css } from "@emotion/react";

const styles = {
    calendar: css`
      width: 100%;
      height: auto;
      color: white;
      border: 2px solid;
      align-content: start;
      .calendar-body {
        width: 100%;
        grid-template-rows: auto;
        grid-auto-rows: auto;
        .day-name {
          height: 50px;
        }
      }
    `,
    day: css`
      border: 1px solid;
      padding: 0px;
      min-height: max-content;
      height: 86px;
    `,
    today: css`
      font-weight: bolder;
      border-width: 2px;
    `
}

const CalendarComponent: React.FC = () => {
    return (
        <Card className="w-2/3 h-auto">
            <Calendar calendars={[{calendarId: process.env.CALENDAR_ID}]} apiKey={process.env.GOOGLE_API_KEY} styles={styles} showFooter={false} />
        </Card>
    );
}

export default CalendarComponent;
