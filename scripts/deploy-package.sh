#!/bin/sh

CHANGED_FILES=$(git status --porcelain)
SHOULD_RELEASE='false'

run_release()
{
  npm run link
  npx lerna run start:package:prod

  git add .
  git commit -m 'new automated release'
  git push

  npx lerna publish patch --yes --no-private
}

main()
{
  for FILE in $CHANGED_FILES
  do
    if [[ $FILE =~ "src/packages/datareade" ]]
    then
      SHOULD_RELEASE='true'
    fi

    if [[ $FILE =~ "src/packages/mediareade" ]]
    then
      SHOULD_RELEASE='true'
    fi

    if [[ $FILE =~ "src/data" ]]
    then
      SHOULD_RELEASE='true'
    fi

    if [[ $FILE =~ "src/util" ]]
    then
      SHOULD_RELEASE='true'
    fi
  done

  if [[ $SHOULD_RELEASE == 'true' ]]
  then
    echo 'Proceed with release'
    run_release
  else
    echo 'datareade and mediareade has no new changes.'
  fi
}

main
