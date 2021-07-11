import {makeStyles, useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import BottomNavigation from "@material-ui/core/BottomNavigation";

import DateRangeSelector from "./DateRangeSelector";
import SensorToggles from "./SensorToggles";

console.debug('Controls => Loading...')


const useStyles = makeStyles((theme) => ({
    title: {
        flexGrow: 1,
    },
    toolbar: {
        maxHeight: 20,
    },
    stickToBottom: {
        background: theme.palette.primary.main,
        color: 'white',
        width: '100%',
        position: 'fixed',
        bottom: 0,
    },
}));

export function WeatherToolbar({db, onSyncToggled, onSensorToggled, minDate, onSubmit}) {
    console.debug('WeatherToolbar => Running...')
    console.debug('ButtonAppBar => Running...');
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));
    const isOverMedium = useMediaQuery(theme.breakpoints.up('lg'));
    const classes = useStyles();


    return (
        <AppBar position="static">
            <Toolbar variant="dense" className={classes.toolbar}>
                <IconButton
                    onClick={(e) => onSyncToggled}
                    edge="start"
                    color="secondary"
                    size={!isOverMedium ? "small" : "medium"}
                    aria-label="toggle-realtime"
                >⛈️</IconButton>
                <Typography variant={!isOverMedium ? "button" : "h6"} className={classes.title}>
                    Weather Station
                </Typography>
                <DateRangeSelector minDate={minDate} onSubmit={onSubmit}/>
                {((isMedium && !isMobile) || !isMedium) && <SensorToggles
                    db={db}
                    onSensorToggled={onSensorToggled}
                />}
            </Toolbar>
        </AppBar>
    );
}


export function WeatherFooter({db, onSensorToggled}) {
    const classes = useStyles();
    return (
        <BottomNavigation color="accent" className={classes.stickToBottom}>
            <SensorToggles
                db={db}
                onSensorToggled={onSensorToggled}
            />
        </BottomNavigation>
    )
}
