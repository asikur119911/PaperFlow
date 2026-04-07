#!/usr/bin/bash


to_be_searched=$1

grep -rI --exclude-dir={node_modules,target,.venv,.venv312,.next} --exclude=package-lock.json "$to_be_searched" .