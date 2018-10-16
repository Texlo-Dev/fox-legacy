<template>
	<div>
		<br><br>
		<section class="section">
			<div class="container">
				<h1 class="title has-text-white">
					Commands
				</h1>
				<div class="is-divider"></div>
				<br>
				<p class="has-text-centered">
					&#60;&#62; indicates required arguments.
				</p>
				<p class="has-text-centered">
					[] indicates optional arguments.
				</p>
				<p class="has-text-centered">
					| separates multiple possible arguments.
				</p>
			</div>
		</section>

		<section class="section">

			<div class="container">
				<div class="columns">
                    <div class="column is-one-quarter">	
						<div class="box">
							<h1 class="title has-text-white">
							Select Category
						</h1>
							<aside class="menu">
								<ul class="menu-list">
    							<li class="has-text-centered" :key="category" v-for="(cmd, category) of commands"><a @click="scrollTo(category)" :class="{ 'is-active':  activeCat === category }"><p class="has-text-white">{{ category }} </p></a></li>
  								</ul>
							</aside>
						</div>

					
							
					</div>
					<div class="column is-three-quarters">
						<div class="box">
							<h3 class="title has-text-white has-text-centered">
								{{ activeCat }}
							</h3>
							<div class="content">
								<b-table 
									:paginated="willPaginate(activeCat)"
                                	per-page="7"
                                	:current-page.sync="activePage"
                                	:pagination-simple="true" class="has-text-white" :data="commands[activeCat]" :columns="columns">
								</b-table>	
							</div>
						</div>
					</div>
					
				</div>
				<!--<h1 v-for="(cmd, category) in commands" class="subtitle has-text-white">
					{{ category }}
					<br><br>
					<div class="columns is-multiline ">
						<div v-for="cmd of commands[category]" class="column is-one-third">
							<div class="box">
								<div class="content">
									<h4 class="subtitle has-text-grey">
										{{ cmd.name }}
									</h4>
									<p class="has-text-left">{{ cmd.description }}</p>
									<p class="has-text-left">Usage: <strong class="has-text-white has-text-left">{{ `${cmd.name} ${cmd.usage ? cmd.usage : ''}` }}</strong></p>
									<p class="has-text-left">Required Permission(s): {{ cmd.reqPermString != false ? cmd.reqPermString.join(', ') : 'None' }}</p>
								</div>
							</div>
						</div>
					</div>
				</h1>-->
			</div>

		</section>

	</div>

</template>

<script>
import API from "../API.js";
export default {
    auth: false,
    head() {
		return {
			title: 'Mr.Fox Bot - Commands',
			meta: [
				{ hid: 'description', name: 'description', content: `A full list of Mr.Fox Bot's commands, their usage, and required permissions.`}
			]
		}
	},
    name: "Commands",
    data() {
        return {
			commands: null,
			activeCat: 'Automod',
			activePage: 1,
			columns: [{
				field: 'name',
				label: 'Name'
			}, {
				field: 'description',
				label: 'Description'
			}, {
				field: 'usage',
				label: 'Usage'
			}, {
				field: 'requiredPerms',
				label: 'Required Permission(s)'
			}]
        };
    },
    async asyncData({ params, app }) {
		const { data: commands } = await app.$axios.get('/api/commands');
		for (const val in commands) {
			for (const cmd of commands[val]) {
				cmd.usage =  `${cmd.name} ${cmd.usage ? cmd.usage : ''}`;
				cmd.requiredPerms = `${cmd.reqPermString != false ? cmd.reqPermString.join(', ') : 'None'}`;
			}
		}
        return {
            commands
        }
	},
	methods: {
		willPaginate(category) {
            return this.commands[category].length >=7;
        },
		makeActive(data) {
			this.commands[data].active = true;
		},
		scrollTo(category) {
			this.activeCat = category;
			this.activePage = 1;
        	//window.scrollTo(window.height / 1000, window.innerWidth / 1000);           
        }
	}
    /*methods: {
        async getCommands() {
            this.loading = true;
            this.$vs.loading({
                type: "sound",
                background: "#34383c",
                color: "#ee0a55",
                container: "#loader"
            });

            try {
                this.commands = await API.commands();
            } catch (error) {
                await this.$vs.loading.close("#loader > .con-vs-loading");
                this.$dialog.alert({
                    message: `Unable to edit this package: ${error}`,
                    type: "is-danger",
                    onConfirm: () => {
                        this.loading = false;
                        this.$router.push({ path: "/" });
                    }
                });
            } finally {
                this.loading = false;
                this.loaded = true;
            }
        }
    },
    async mounted() {
        const cmds = this.getCommands();
    }*/
};
</script>

<style>
.vs-label {
	font-size: large
}
th {
    background-color: #34383c
}

td {
    background-color: #34383c;
	color: #eff;
    
}

.content table td {
    border-color: #242424
    
}

.content table th {
    border-color: #242424
}


.table.has-mobile-cards tr td {
     border-color: #242424
}

 td span {
     color: #eff
        
    }

.th-wrap {
   color: #eff
        
    }
.center {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
}
.input-select {
        color: #242424;
    }
</style>
