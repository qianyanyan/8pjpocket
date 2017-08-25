#!/usr/bin/env bash
bashPath=$(pwd)
function clear(){
echo "start clean project"
rm -rf node_modules/ && rm -rf platforms/ && rm -rf plugins/
echo "clean project finish"
}
if [ "$1" == "build" ]; then
    if [ "$3" == "clear" ]; then
        clear
    fi
    if [ "$2" == "android" ]; then
        ionic cordova build android --verbose --release
    elif [ "$2" == "ios" ]; then
        ionic cordova build ios --verbose --release
    fi
elif [ "$1" == "run" ]; then
    if [ "$3" == "clear" ]; then
        clear
    fi
    if [ "$2" == "android" ]; then
        ionic cordova run android --verbose --release
    elif [ "$2" == "ios" ]; then
        ionic cordova run ios --verbose --release
    fi
fi
