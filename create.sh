#!/usr/bin/env bash

# allows me to create terrible projects faster than ever before

if [  -z "$1" ]
then
    echo "No arguments supplied"
    exit 0
fi

name=$1

# https://unix.stackexchange.com/a/295815
DIR="$(cd "$(dirname "$0")" && pwd)"

# hopefully forward slashes in a path never comes to bite me

if [ -f "${DIR}/docs/${name}.html" ];
then
    echo "Page ${name}.html already exists"
fi

projectrootdir="${DIR}/docs"



touch "${projectrootdir}/${name}.html"
touch "${projectrootdir}/scripts/${name}.ts"
touch "${projectrootdir}/stylesheets/${name}.css"

