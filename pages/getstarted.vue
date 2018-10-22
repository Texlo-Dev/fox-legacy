<template>
    <div>
        <br class='is-hidden-touch'>
        <section class="section">
            <div class='container'>
                <h1 class="title has-text-white has-text-left">
					Getting Started
				</h1>
                <div class="is-divider"></div>
            </div>
            <div class="container">
                <div class="columns">
                    <div class="column is-half">
                        <b-message type="is-primary">
                            <p>Once you have clicked on the bot's invite link and accepted the invite, you should recieve a message in your server, like the one here.</p>
                            <p>This message contains helpful information for the Server Owner, such as our Discord Server Invite. It is important that you read this message carefully, so that you understand what you need to do to configure Fox.</p>
                        </b-message>

                    </div>
                    <div class="column is-half">
                        <img id="columnimg" :src="require('../assets/welcomeimg.png')">
                    </div>
                </div>

            </div>
        </section>
        <section class="section">
            <div class='container'>
                <h1 class="title has-text-white has-text-left">
					Packages
				</h1>
                <div class="is-divider"></div>
            </div>
            <div class='container'>
                <div class="columns">
                    <div class="column is-half">
                        <b-message type="is-primary">
                            <p>Mr.Fox's commands are grouped together into packages, which dictate the category that the command is in. As stated in the message, only the Core command package is enabled by default, so you will have to enable the packages that contain the commands that you want to use. You may either follow the directions with the in-server command, or use the dashboard to enable certain packages.</p>
                        </b-message>
                        <div class="column">
                            <h1 class="title has-text-white has-text-left">
							Prefix
						</h1>

                            <div class="is-divider"></div>
                            <b-message type="is-primary">
                                <p>By default, the current bot prefix is <strong class="has-text-white">f)</strong>. To change it, you can use the built-in prefix command in-server or use the online dashboard.</p>
                            </b-message>
                            <b-message type="is-warning">
                                <p>Note: The default prefix will no longer function as you are using a custom prefix.</p>
                            </b-message>
                        </div>
                        <img class="center" id="columnimg" :src="require('../assets/chgprefix.png')">

                    </div>
                    <div class="column">
                        <img id="columnimg" :src="require('../assets/cmdpkgs.png')">

                    </div>
                </div>

            </div>
        </section>
    </div>
</template>

<style>
#columnimg {
	border-radius: 25px;
	border: 5px solid #242424
}
.message-body {
    background-color: #242424
}
.center {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
}
</style>

<script>
export default {
    auth: false,
	head() {
		return {
			title: 'Mr.Fox Bot - Getting Started',
			meta: [
				{ hid: 'description', name: 'description', content: 'A quick-start guide to learning Mr.Fox Bot, and setting him up in your Discord server.' }
			]
		}
	}
}
</script>
