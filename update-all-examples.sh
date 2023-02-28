#!/bin/sh

# abort on errors
set -e

OUTPUT_DIR="./examples"
SDJWT_ARGS="--output-dir $OUTPUT_DIR --nonce XZOUco1u_gEPknxS78sWWg --iat 1516239022 --exp 1516247022 --no-randomness"

#rm -r $OUTPUT_DIR/*

sd_jwt verifiedemail.yml $SDJWT_ARGS

echo "Remember to add updated examples to git repository:"
echo "git add $OUTPUT_DIR"