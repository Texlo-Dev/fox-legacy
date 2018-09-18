<script>
export default {
    name: "serveradd",
    created() {
        const code = this.$route.query.code;
        const guild = this.$route.query.guild_id;
        if (window.opener) {
            const openerVue = window.opener.vue;
            if (!code) return window.close();
            openerVue.$router.push({ path: `/servers/${guild}` });
            window.close();
        } else if (!code) {
            return this.$router.push({ name: "/servers" });
        }
    }
};
</script>
