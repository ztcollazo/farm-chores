import * as React from "react";
import Card from "./Card";
import Calendar from "@ericz1803/react-google-calendar";
import { css } from "@emotion/react";
import colors from "tailwindcss/colors";

const styles = {
    calendar: css`
      width: 100%;
      height: auto;
      color: ${colors.white};
      border: 2px solid ${colors.gray};
      align-content: start;
      .calendar-body {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(7, auto);
        grid-template-rows: auto;
        grid-auto-rows: auto;
        .day-name {
          height: 50px;
        }
      }
    `,
    day: css`
      border: 1px solid ${colors.gray};
      padding: 0px;
      height: 85px;
    `,
    today: css`
      font-weight: bolder;
      border-width: 2px;
    `
}

const CalendarComponent: React.FC = (): JSX.Element => {
    return (
        <Card className="w-2/3 h-auto">
            <Calendar calendars={[]} apiKey={""} styles={styles} showFooter={false} />
        </Card>
    );
}

export default CalendarComponent;
