# stroll-backend-stack

## Deploying Changes

To deploy updates to the production server, use

``sam deploy --stack-name stroll-backend-stack --config-env prod``

## Testing Changes

Before deploying however, you should always test your changes

locally,

``sam local start-api --parameter-overrides ParameterKey=FirebaseProjectId,ParameterValue=strll-318021``

and on the server,

``sam deploy --stack-name stroll-backend-stack --config-env test``
