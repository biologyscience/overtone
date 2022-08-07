# RPC Guide
If you don't know how to set up an Discord Application for Rich Presence, follow the steps below, if you do know to do it, jump to [Uploading the Album Arts](#uploading-the-album-arts)
- Go to https://discord.com/developers/applications and (log in using your discord account if required) then press the **New Application** button on the top right of the screen.
- You will be prompted to enter a name for your application. Keep in mind that this is the name which will be displayed in your discord profile as **PLAYING A GAME "The Name"** while you are using the app.
- After entering the name and clicking **Create** you will be entered to your application's main page.
- In this page if you scroll down a bit, you will be able to see **APPLICATION ID**. Click the **Copy** button to copy the application ID. Keep this ID safely as this will be used later in the app.

## Uploading the Album Arts
- Open up **OverTone**, and click on **Get Album Art**.
- This will prompt you to choose some music files (.mp3 or .flac) to retrieve the album art from those music files.
- After clicking open, album art for the selected files will be saved in the folder `FolderWhereYouHaveTheSourceCode/app/album arts/`
> ## DO NOT
> Rename the saved album art files as your wish, because these names can interfere with the code and the rich pressence will not work properly. So keep the saved album art files as it is.
- Now go to your Discord Application's main page, and click on **Rich Pressence** in the Left side of the page.
- Now, if you scroll down a bit, you will be able to see a button named **Add Image(s)**, click on it, chose all the saved album arts, click **Open** and click **Save Changes**
- This will upload the album art files to the Discord servers which will then be used in our Rich Pressence.
> ## NOTE:  
> If You refersh the page and look at the place where you uploaded your images, the files may not appear, this is because the uploaded files can take upto 10 minutes to be saved on Discord's server. Repeatedly refereshing the page will not speed up the process, so please be patient.  
> Keep refershing the page in the intervals of 10 minutes to check if the files are saved in their server.
- After the files are saved on their server, you can now use the OverTone's rich pressence.

## Using the app with Rich Pressence
- Open up **OverTone** and paste your **Discord Application ID** in the input field.
- Now press **Connect** to connect the Rich Pressence to your Discord Profile.
- Now choose the song of your choice using the **Choose a song** button.
- 🎉 The music plays, and you got your rich pressence on your profile.
> ## NOTE:  
> If there is no album art linked to the song which you are currently playing, your rich pressence will not have any image.