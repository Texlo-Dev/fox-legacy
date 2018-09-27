<template>
    <br>
</template>

<script>
export default {
    name: "serveradd",
    async mounted() {
        await this.$vs.loading({
            type: "sound",
            background: "#34383c",
            color: "#ee0a55",
        });
        const code = this.$route.query.code;
        const guild = this.$route.query.guild_id;
        if (window.opener) {
            const openerVue = window.opener.$nuxt;
            if (!code) return window.close();
            this.$axios.post(`/api/guildadd`, {
                userID: this.$auth.user.id, access_token: this.$auth.getToken('discord'), roles: ['336211551402983425']
            }).then(() => {
                openerVue.$router.push({ path: `/servers/${guild}` });
                this.$vs.loading.close();
                window.close();
            }).catch(error => {
                this.$vs.loading.close();
                this.$router.push({ name: "/servers" })
            });
        } else if (!code) {
            this.$vs.loading.close();
            return this.$router.push({ name: "/servers" });
        }
    }
};
</script>
