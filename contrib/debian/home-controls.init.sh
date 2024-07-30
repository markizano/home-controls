#!/bin/sh

### BEGIN INIT INFO
# Provides:             home-controls
# Required-Start:       $network $local_fs $syslog
# Required-Stop:        $network $local_fs $syslog
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    Home controls service to allow for remote control from devices.
# chkconfig:            2345 99 01
### END INIT INFO

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
NAME=home-controls
PIDFILE=/run/$NAME.pid
DAEMON=/usr/bin/node
DAEMON_USER=hcuser
DAEMON_GROUP=kizano
DAEMON_SCRIPT=/usr/share/kizano/home-controls/server/index.js
DAEMON_NAME=home-controls
STARTSTOP_ARGS='INT/10/TERM/10/KILL/5'
SCRIPTNAME=/etc/init.d/$NAME

umask 0022

if [ -f /etc/default/$NAME ] ; then
	. /etc/default/$NAME
fi

. /lib/lsb/init-functions

do_start() {
    # Return
    #   0 if daemon has been started
    #   1 if daemon was already running
    #   2 if daemon could not be started
    pid=$(pidofproc -p "$PIDFILE" "$DAEMON_NAME")
    if [ -n "$pid" ]; then
        return 1
    fi

    start-stop-daemon --start --quiet --pidfile $PIDFILE --make-pidfile --background \
      --chuid "$DAEMON_USER:$DAEMON_GROUP" \
      --user $DAEMON_USER --group $DAEMON_GROUP --exec $DAEMON -- $DAEMON_SCRIPT || return 2
}

do_stop() {
    # Return
    #   0 if daemon has been stopped
    #   1 if daemon was already stopped
    #   2 if daemon could not be stopped
    #   other if a failure occurred
    start-stop-daemon --stop --quiet --retry "$STARTSTOP_ARGS" --pidfile $PIDFILE --remove-pidfile
    RETVAL="$?"
    [ "$RETVAL" = 2 ] && return 2
    rm -f $PIDFILE
    return "$RETVAL"
}

case "$1" in
    start)
        [ "$VERBOSE" != no ] && log_daemon_msg "Starting $DESC" "$NAME"
        do_start
        case "$?" in
            0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
              2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
        esac
        ;;
    stop)
        [ "$VERBOSE" != no ] && log_daemon_msg "Stopping $DESC" "$NAME"
        do_stop
        case "$?" in
            0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
              2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
        esac
        ;;
    status)
        status_of_proc "$DAEMON_NAME" "$NAME" && exit 0 || exit $?
        ;;
    #reload)
        # not implemented
        #;;
    restart|force-reload)
        log_daemon_msg "Restarting $DESC" "$NAME"
        do_stop
        case "$?" in
          0|1)
              do_start
              case "$?" in
                  0) log_end_msg 0 ;;
                  1) log_end_msg 1 ;; # Old process is still running
                  *) log_end_msg 1 ;; # Failed to start
              esac
              ;;
          *)
              # Failed to stop
              log_end_msg 1
              ;;
        esac
        ;;
    *)
        echo "Usage: $SCRIPTNAME {start|stop|status|restart|force-reload}" >&2
        exit 3
        ;;
esac

exit 0
