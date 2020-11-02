#!/usr/bin/env python3

import os
import sys

os.system("""
cd ang-app
npm run serve:single-spa:ang-app &
cd ..
cd ang-app2
npm run serve:single-spa:ang-app2 &
cd ..
cd ang-app3
npm run serve:single-spa &
cd ..
cd navbar
npm run serve:single-spa &
cd ..
cd root-html-file
npm run start &
cd ..
""")