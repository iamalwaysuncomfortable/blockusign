docker build blockument
eval $( aws ecr get-login --no-include-email )
docker tag blockument 293065333722.dkr.ecr.us-east-1.amazonaws.com/blockument
docker push 293065333722.dkr.ecr.us-east-1.amazonaws.com/blockument