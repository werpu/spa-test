#!/usr/bin/env python3

import os
import sys

os.system("""
cd angular9
npm run serve:single-spa:ang-app &
cd ..
cd angular8
npm run serve:single-spa:ang-app2 &
cd ..
cd angular7
npm run serve:single-spa &
cd ..
cd navbar
npm run serve:single-spa &
cd ..
cd root-html-file
npm run start &
cd ..
""")