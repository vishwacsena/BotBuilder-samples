@echo off
REM TODO: handle case when %1 is not specified
SET projectName=%1
REM TODO: handle case when %2 is not specified
SET LUISRegion=%2 
REM TODO: handle case when %3 is not specified
SET LUISAuthKey=%3

REM TODO: install npm, botbuilder-tools
SET LUISBasePath=https://%LUISRegion: =%.api.cognitive.microsoft.com/luis/api/v2.0
SET NewLUISVersion=1
SET NewLUISAppId=""
SET t=""

REM Create transcripts..
ECHO Creating transcripts...
For /F %%G IN ('dir /b Mockups\*.chat') DO call chatdown --in Mockups\%%G --out Transcripts\%%G
ECHO Transcripts created. Can be found under Transcripts\*.transcript

REM Create LUIS and QnA models...
ECHO Creating models

REM do we have a LUISPublishProperties file? 
IF EXIST LU\models\LUISPublishProperties.json (
   REM File exists
   FOR /F "tokens=1,2,3 delims=,: " %%G IN (LU\models\LUISPublishProperties.json) DO call :setLUISVersion %%H
   GOTO Next
   :setLUISVersion
       SET t=%1
       SET CurrentLUISversion=%t:"=%
       ECHO Current LUIS Version = %CurrentLUISversion%
       SET /a NewLUISVersion=%CurrentLUISversion% + 1
       ECHO New LUIS Version = %NewLUISVersion%
   GOTO :eof
) ELSE (
   GOTO :Next   
)

:Next
REM Update LUISPublishProperties.json
ECHO Updating LUISPublishProperties.json
call ECHO {"versionId": "%NewLUISVersion%", "isStaging": false, "region": "%LUISRegion%"} > LU\models\LUISPublishProperties.json

call ludown LU\root.lu -o LU\models -n %1 -m %1 -q -t --luis_versionId %NewLUISVersion%
ECHO LUIS and QnA Models created. 
ECHO Models be found under LU\models - %1_LUISApp.json, %1_qnaKB.json, %1_qnaTSV.tsv, %1_LUISBatchTest.json

REM do we need to create a new luis app or create a new version?
IF "%NewLUISVersion%"=="1" (
  ECHO Creating .luisrc
  ECHO {"appId":"","authoringKey":"%LUISAuthKey%","versionId":"%NewLUISVersion%","endpointBasePath":"%LUISBasePath%"} > .luisrc
  ECHO Creating new LUIS app
  FOR /F %%A in ('luis apps create import --in LU\models\%1_LUISApp.json') do call :setNewLUISAppId %%A
  GOTO :QnA
  :setNewLUISAppId
      SET t=%1
      SET NewLUISAppId=%t:"=%
      ECHO Updating .luisrc with new LUIS app Id = %NewLUISAppId%
      ECHO {"appId":"%NewLUISAppId%","authoringKey":"%LUISAuthKey%","versionId":"%NewLUISVersion%","endpointBasePath":"%LUISBasePath%"} > .luisrc
      ECHO Training the newly created model
      call luis train create>nil
      ECHO Waiting for train to complete
      REM TODO: Fix this so we can call train get and check status
      timeout /t 30
      ECHO Training status
      call luis train get
      ECHO Publishing new LUIS app
      call luis apps create publish --in LU\models\LUISPublishProperties.json>nil
      ECHO LUIS app published!
      REM TODO: Update dispatch
  GOTO :eof
) ELSE (
  ECHO Updating existing LUIS app
  ECHO Updating .luisrc
  FOR /F "tokens=1,2,3 delims=,: " %%A IN (.luisrc) DO call :newLUISVersion %%B
  GOTO :QnA
  :newLUISVersion
      SET t=%1
      set LUISAppId=%t:"=%
      ECHO {"appId":"%LUISAppId:"=%","authoringKey":"%LUISAuthKey%","versionId":"%NewLUISVersion%","endpointBasePath":"%LUISBasePath%"} > .luisrc
      ECHO Creating a new LUIS app version
      call luis versions versions import create --in LU\models\%projectName%_LUISApp.json --versionId %NewLUISVersion%>nul
      ECHO New LUIS version created
      ECHO Training the newly created model
      call luis train create>nul
      ECHO Waiting for train to complete
      REM TODO: Fix this so we can call train get and check status
      timeout /t 30 
      ECHO Training status
      call luis train get
      ECHO Publishing new LUIS app version
      call luis apps create publish --in LU\models\LUISPublishProperties.json>nul
      ECHO LUIS app version published!
  GOTO :eof
)

:QnA






@echo on
:THEEND