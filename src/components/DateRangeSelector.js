import './DateRangeSelector.css';

// Utils
import {useEffect, useState} from "react";
import {getTime, intervalToDuration, subDays} from "date-fns";
import {durationToPeriod} from "../util/time";

// Components
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

// Extras
import {DateTimePicker} from "@material-ui/pickers";
import IconButton from "@material-ui/core/IconButton";

console.debug('DateRangeSelector => Loading...')


/**
 * Date Range Selector
 *
 * @param {function} onSubmit A callback for when the Submit is triggered
 * @returns {JSX.Element}
 * @constructor
 */
export default function DateRangeSelector({onSubmit = console.debug ,minDate}) {
    console.debug('DateRangeSelector => Running...')
    /**
     * The First Date
     * Should never be before the End Date
     */
    const [_startDate, setStartDate] = useState(getTime(subDays(Date.now(), 1)))
    /**
     * The End Date
     * Should always be greater than or equal to the Start Date
     * Should never be after the current time
     */
    const [_endDate, setEndDate] = useState(getTime(Date.now()));

    /**
     * Interval
     */
    const [_interval, setInterval] = useState({start: _startDate, end: _endDate})

    /**
     * The Period
     */
    const [_period, setPeriod] = useState('hour');

    const [_open, setOpen] = useState(false);
    const [_transitionDuration, setTransitionDuration] = useState(100)
    // Update Period
    useEffect(() => {
        setPeriod(durationToPeriod(intervalToDuration(_interval)))
    }, [_interval])

    // Update Interval
    useEffect(() => {
        setInterval({
            start: _startDate,
            end: _endDate,
        })
    }, [_startDate, _endDate])

    function setFastOpen(value, fast = false) {
        if (fast) setTransitionDuration(0)
        else setTransitionDuration(100)
        setOpen(value)
    }

    return (
        <div>
            <IconButton
                onClick={() => setOpen(true)}
                edge="start"
                color="inherit"
                aria-label="toggle-range"
            >⚙️</IconButton>
            <Dialog transitionDuration={_transitionDuration} open={_open} onClose={() => setFastOpen(false)}
                    aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Date/Time Range</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select the range you would like to search for. The Period will update to the "best"
                        search to limit load on the database. You can override this by selecting a different
                        Period after selecting a date range.
                    </DialogContentText>
                    <form>
                        <FormControl>


                            <DateTimePicker
                                variant="dialog"
                                minDate={minDate}
                                maxDate={_endDate}
                                value={_startDate}
                                onChange={(e) => {
                                    setTransitionDuration(0);
                                    setStartDate(e.getTime())
                                }}
                                disableFuture
                            />
                        </FormControl>
                        <FormControl>
                            <DateTimePicker
                                variant="dialog"
                                value={_endDate}
                                minDate={minDate}
                                onChange={(e) => {
                                    setTransitionDuration(0);
                                    setEndDate(e.getTime())
                                }}
                                disableFuture
                            />
                        </FormControl>
                        <FormControl>
                            <Select
                                value={_period}
                                onChange={e => setPeriod(e.target.value)}
                            >
                                <MenuItem value='minute'>Minutes</MenuItem>
                                <MenuItem value='hour'>Hours</MenuItem>
                                <MenuItem value='day'>Days</MenuItem>
                                <MenuItem value='week'>Weeks</MenuItem>
                                <MenuItem value='quarter'>Quarters</MenuItem>
                                <MenuItem value='year'>Years</MenuItem>
                            </Select>
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setFastOpen(false)
                    }} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={
                            (e) => {

                                onSubmit({start: _startDate, end: _endDate, period: _period})
                                setFastOpen(false)
                            }
                        }
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
