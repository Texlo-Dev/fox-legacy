<template>
<div>
</div>
    
</template>


<script>
export default {
    head() {
		return {
            title: 'Mr.Fox Bot - Login',	
            meta: [
                { hid: 'description', name: 'description', content: `Log in to the Mr.Fox Bot Dashboard via Discord.` }
            ]  
		}
	},

    created() {
        this.$auth.loginWith('discord');
    }
}
</script>
