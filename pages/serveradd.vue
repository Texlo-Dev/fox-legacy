<template>
    <br>
</template>

<script>
export default {
    name: "serveradd",
    async mounted() {
        const code = this.$route.query.code;
        const guild = this.$route.query.guild_id;
        if (window.opener) {
            const openerVue = window.opener.$nuxt;
            if (!code) return window.close();
            this.$axios.post(`/api/guildadd`, {
                userID: this.$auth.user.id, access_token: this.$auth.getToken('discord'), roles: ['336211551402983425']
            }).then(() => {
                openerVue.$router.push({ path: `/servers/${guild}` });
                window.close();
            }).catch(error => {
                this.$vs.loading.close();
                this.$router.push({ name: "/servers" })
            });
        } else if (!code) {
            return this.$router.push({ name: "/servers" });
        }
    }
};
</script>
