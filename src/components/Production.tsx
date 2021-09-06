import * as React from "react";
import Card from "./Card";
import humanizeString from "humanize-string";
import {useAsyncFn} from "react-use";
import {GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import {GoogleOauthContext} from "./context";
import {googleSignIn} from "../lib/google-oauth";

function join(t: Date, a: Array<Record<string, string>>, s: string) {
    function format(m: Record<string, string>) {
        const f = new Intl.DateTimeFormat('en', m);
        return f.format(t);
    }
    return a.map(format).join(s);
}

const a = [{month: 'numeric'}, {day: 'numeric'}, {year: 'numeric'}];

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

const Production: React.FC<{className?: string}> = ({className}) => {
    let sheets: Record<string, GoogleSpreadsheetWorksheet> = {};
    let sheet: GoogleSpreadsheetWorksheet = null;
    const [type, setType] = React.useState("button");
    const [value, setValue] = React.useState("Add Field");
    const [dailyValues, setDailyValues] = React.useState<Record<string, number>>({});
    const [submittedValues, setSubmittedValues] = React.useState<Record<string, number>>({});
    const [numUpdates, setNumUpdates] = React.useState(0);
    const {setToken, setRefreshToken, setExpiryDate, setScope, key, setTokens, token, secret, refreshToken, expiryDate, scope} = React.useContext(GoogleOauthContext)

    const isAuthorized = (): boolean => {
        return !!localStorage.getItem("google_access_token");
    }

    React.useEffect(() => {
        if (isAuthorized()) {
            setToken(localStorage.getItem("google_access_token"));
            setRefreshToken(localStorage.getItem("google_refresh_token"));
            setExpiryDate(Number(localStorage.getItem("google_expires_in")));
            setScope(localStorage.getItem("google_scope"));
            setTokens({
                access_token: token,
                refresh_token: refreshToken,
                expires_in: expiryDate,
                scope
            });
        }
    }, []);

    const getInfo = async () => {
        try {
            await doc.loadInfo();
            sheets = doc.sheetsByTitle;
            sheet = sheets[new Date().getFullYear()];
            await sheet.loadHeaderRow();
            const rows = await sheet.getRows();
            const row = rows[rows.length-1];
            if (row.Date === join(new Date, a, "/")) {
                const sub: Record<string, number> = {};
                const daily: Record<string, number> = {};
                Object.keys(row).filter((f) => f !== "Date" && !f.startsWith("_")).map((k) => {
                    sub[k] = row[k];
                    daily[k] = 0;
                });
                setSubmittedValues(sub);
                setDailyValues(daily);
            }
            const dailyHeaders: Record<string, number> = {};
            sheet.headerValues.filter((f) => f !== "Date" && !f.startsWith("_")).map((k) => {
                dailyHeaders[k] = dailyValues[k] ? dailyValues[k] : 0;
            });
            setDailyValues(dailyHeaders);
            setNumUpdates(0);
        } catch (e) {
            console.log(e);
            if (e.toString().includes("[401]")) {
                console.log(refreshToken);
                const refresh = refreshToken ?? localStorage.getItem("google_refresh_token")
                if (refresh) {
                    login(refresh)
                    if (numUpdates === 0) {
                        setNumUpdates(1);
                        await getInfo()
                    }
                } else {
                    setToken("");
                }
            }
        }
    }

    React.useEffect(() => {
        if (token) {
            doc.useRawAccessToken(token);
            (async () => await getInfo())();
        }
    }, [token]);

    const login = (refresh: string = null): void => {
        console.log(refresh);
        googleSignIn("http://localhost:3000/main_window", key, secret, refresh).then((tokens) => {
            console.log(tokens);
            if (tokens.access_token) {
                setToken(tokens.access_token);
                localStorage.setItem("google_access_token", tokens.access_token);
                doc.useRawAccessToken(tokens.access_token);
            }
            if (tokens.refresh_token) {
                setRefreshToken(tokens.refresh_token);
                localStorage.setItem("google_refresh_token", tokens.refresh_token);
            }
            if (tokens.expires_in) {
                setExpiryDate(tokens.expires_in)
                localStorage.setItem("google_expires_in", tokens.expires_in);
            }
            if (tokens.scope) {
                setScope(tokens.scope);
                localStorage.setItem("google_scope", tokens.scope);
            }
            setTokens(tokens);
            (async () => await doc.loadInfo())();
        });
    }

    const authorize: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        login(null);
    }

    const [state, mutate] = useAsyncFn(async (vals: Record<string, number>): Promise<GoogleSpreadsheetRow> => {
        await doc.loadInfo();
        sheets = doc.sheetsByTitle;
        sheet = sheets[new Date().getFullYear()];
        await sheet.setHeaderRow(["Date", ...Object.keys(vals)]);
        return await sheet.addRow(Object.assign({
            Date: join(new Date, a, '/'),
        }, vals))
    });

    const changeHeaders = (subs: boolean, row: GoogleSpreadsheetRow): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!subs) {
                sheet.setHeaderRow(['Date', ...Object.keys(row).filter((a) => a !== "Date" && !a.startsWith("_")), ...Object.keys(dailyValues).filter((k) => !Object.keys(row).includes(k))]).then(() => {
                    Object.keys(dailyValues).map((k) => {
                        if (row[k] === 0 || row[k] === undefined) {
                            row[k] = dailyValues[k];
                        } else {
                            row[k] = Number(row[k]) + dailyValues[k];
                        }
                    });
                    sheet.loadHeaderRow().then(() => resolve());
                }).catch((error) => {
                    reject(error);
                });
            } else {
                Object.keys(dailyValues).map((k) => {
                    if (row[k] === 0 || row[k] === undefined) {
                        row[k] = Number(dailyValues[k]);
                    } else {
                        row[k] = Number(row[k]) + Number(dailyValues[k]);
                    }
                });
                resolve();
            }
        })
    }

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
        try {
            await doc.loadInfo();
        } catch (e) {
            if (e.toString().includes("[401]")) {
                console.log(refreshToken);
                const refresh = refreshToken ?? localStorage.getItem("google_refresh_token")
                if (refresh) {
                    login(refresh)
                } else {
                    authorize(event);
                }
            }
        }
        sheets = doc.sheetsByTitle;
        sheet = sheets[new Date().getFullYear()];
        const rows = await sheet.getRows();
        console.log(rows);
        if (rows[rows.length-1].Date === join(new Date(), a, '/')) {
            const row = rows[rows.length-1];
            const subs = Object.keys(dailyValues).map((k) => Object.keys(row).filter(k => k.toLocaleLowerCase() !== "date" && !k.startsWith("_")).includes(k)).reduce((a, b) => a && b);
            console.log(subs);
            console.log(row);
            try {
                await changeHeaders(subs, row);
                console.log(row);
                const keys = Object.keys(row).filter(k => k.toLocaleLowerCase() !== "date" && !k.startsWith("_"));
                console.log(keys);

                keys.forEach((m, i) => {
                    row._rawData[i + 1] = row[m];
                });

                await row.save();

                const sub: Record<string, number> = {};
                const daily: Record<string, number> = {};

                keys.forEach((k) => {
                    sub[k] = row[k];
                    daily[k] = 0;
                });

                setSubmittedValues(sub);
                setDailyValues(daily);
            } catch (e) {
                console.error(e);
            }
        } else {
            mutate(dailyValues).then((res) => {
                const keys = Object.keys(res).filter(k => k.toLocaleLowerCase() !== "date" && !k.startsWith("_"));
                console.log(keys);

                const sub: Record<string, number> = {};
                const daily: Record<string, number> = {};

                keys.forEach((k) => {
                    sub[k] = res[k];
                    daily[k] = 0;
                });

                setSubmittedValues(sub);
                setDailyValues(daily);
            });
        }
    }

    const addField: React.MouseEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        if (type === "button") {
            setType("text");
            setValue("");
        }
    }

    const typeField: React.KeyboardEventHandler = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            if (value === "") {
                setType("button");
                setValue("Add Field");
            } else {
                setDailyValues({
                    ...dailyValues,
                    [value]: 0
                });
                setType("button");
                setValue("Add Field");
            }
        }
        if (event.key == "Escape") {
            event.preventDefault();
            setType("button");
            setValue("Add Field");
        }
    }

    console.log(dailyValues);

    return (
        <Card className={className}>
            {
                token ? <div className="grid w-full mt-4" style={{gridTemplateRows: "80% 20%"}}>
                    <div className="w-full grid overflow-scroll scrollbar-none scroll-snap-parent" style={{gridTemplateColumns: "50% 50%"}}>
                    {
                        Object.keys(dailyValues).map((k, i) => {
                            return (
                                <div key={i} className="w-5/6 m-5 scroll-snap-child">
                                    <span
                                        className="text-lg w-full font-extralight text-white opacity-60">{humanizeString(k)}</span>
                                    <span className="w-full">
                                       <input min={0}
                                              step="any"
                                              className="rounded-xl opacity-60 bg-black text-white font-extralight inline-block align-right float-right text-right bg-opacity-10"
                                              value={dailyValues[k]} type="number" onChange={(event) => setDailyValues({
                                           ...dailyValues,
                                           [k]: Number(event.currentTarget.value)
                                       })}/>
                                       <span
                                           className="opacity-60 p-4 text-white font-extralight">({submittedValues[k] ? Number(submittedValues[k]) : 0})</span>
                                   </span>
                                </div>
                            )
                        })
                    }
                    </div>
                    <div className="absolute grid w-full bottom-5" style={{gridTemplateColumns: "50% 50%"}}>
                        <input onClick={addField} onKeyUp={typeField} onChange={(event) => setValue(event.target.value)} type={type}
                               className="font-extralight m-auto p-3 text-center text-lg border rounded-xl text-white border-white opacity-60"
                               style={{
                                   width: "max-content",
                                   outline: "none",
                                   cursor: "pointer",
                                   backgroundColor: "transparent"
                               }} value={value}/>
                        <button onClick={handleClick}
                                className="font-extralight m-auto p-3 text-center text-lg border rounded-xl text-white border-white opacity-60"
                                style={{width: "max-content", outline: "none"}}>Submit
                        </button>
                    </div>
                    <div className="" />
                </div> :
                <button onClick={authorize} className="m-auto p-3 rounded-xl outline-none border border-white opacity-60 text-white font-extralight text-xl">Authorize Google</button>
            }
        </Card>
    )
}

export default Production;

