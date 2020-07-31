RESPONSE=$(npm outdated @dottjt/datareade)

if [[ -z "$RESPONSE" ]]
then
  echo "No need to update @dottjt/datareade"
else
  npm update @dottjt/datareade
fi


