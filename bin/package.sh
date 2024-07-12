#!/bin/bash

set -x
# This script is used to package the application for distribution.

version=$(node -p -e "require('./package.json').version")

rm -rf build
mkdir build

mkdir -p build/DEBIAN build/etc/init.d build/etc/default build/usr/share/kizano

# Copy Debian controls, scripts and other content over.
cp contrib/debian/control build/DEBIAN/
install contrib/debian/preinst build/DEBIAN/preinst

cp contrib/debian/home-controls.init.sh build/etc/init.d/home-controls
cp contrib/debian/home-controls.default.sh build/etc/default/home-controls

# Copy the directory first to create the directory
cp -r dist/ build/usr/share/kizano/home-controls
cp -r server/dist/ build/usr/share/kizano/home-controls/server/
cp -r server/node_modules/ build/usr/share/kizano/home-controls/server/


fakeroot dpkg-deb --build build kizano-home-controls_${version}-all.deb
