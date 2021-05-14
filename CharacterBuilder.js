import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from "axios";
import ArchetypeSelector from "./ArchetypeSelector";
import {indexOfByName, logObj} from './Helpers';
import PowerAssigner from "./PowerAssigner";
import ls from 'local-storage';
import 'bulma/css/bulma.min.css';
import './coh-builder.scss';


class CharacterBuilder extends Component {
    /**
     * 
     * @param { } props the props being passed to this app can be any of the following:
     *  - serverUrl: This is which server usrl to use. Defaults to Homecoming data at https://coh.tips/powers/v2/
     */
    constructor(props) {
        super(props)
        this.server = props.serverUrl? props.serverUrl : "https://coh.tips/powers/v2/";

        this.poolPowerPath = "pool/index.json";
        this.poolPowerUrl = "pool/";

        this.epicPowerPath = "epic/index.json";
        this.epicPowerUrl = "epic/";
        this.state = {
            //root data of the db
            rootData: [],

            //the URL to the selected archetype. this will be set when user selects an archetype
            archetypeUrl: null,
            // Origin possibilities are set on archetype.
            possibleOrigins: [],

            // Primary and Secondary power sets
            // The URL is where to get the info about the power set from the db
            priPowerSetUrl: null,
            secPowerSetUrl: null,
            //the PowerSets is the array of all the possible power set in each pool
            priPowerSets: [],
            secPowerSets: [],

            // poolPowerSets is the list of all possible pool powers
            poolPowerSets: [],

            // poolPowerSets is the list of all possible epic powers
            epicPowerSets: [],


            // toon variables" everything that we will need to make a build
            toon_name: '',
            toon_archetype: {},
            toon_origin: '',
            toon_priPower: {},
            toon_secPower: {},
            toon_pool1: {},
            toon_pool2: {},
            toon_pool3: {},
            toon_pool4: {},
            //we get this from the actual builder part
            toon_powers: [],



            toon_epic: {},

            toon_saved: false,
            info_collapsed: false,
            loaded_components: {
                root_data: false,
                pool_data: false,
                priPowerSets_data: false,
                secPowerSets_data: false,
                toon_priPower_data: false,
                toon_secPower_data: false,
                toon_pool1_data: false,
                toon_pool2_data: false,
                toon_pool3_data: false,
                toon_pool4_data: false,
                epic_data: false,
            },
            collapse_on_load: false,
        };
    }

    /**
     * This function will set a specific component to the loaded state.
     * This is also the hook used to do something after either a specific section of the builder
     * is loaded, or the whole app is loaded.
     * @param {string} data_type - The component to set to a loaded state.
     */
    didLoadComponent(data_type)
    {
        this.state.loaded_components[data_type] = true;
        if(this.state.collapse_on_load && this.isAppLoaded()) {
            this.setState({collapse_on_load: false});
            this.setState({info_collapsed: true});
        }
    }

    /**
     * This is the function that is called when the component is mounted. From here we will
     * be initializing the builder by making the needed data calls to the remote API.
     * The following async calls are made:
     * - Root Data: The root data json that laysout the api
     * - Pool Power Sets: A list of all the available pool powers
     * - Epic Power Sets: A list of all the available Epic Powers
     */
    componentDidMount() {
        //Root Data Call
        axios.get(this.server + "index.json")
            .then(res => {
                const rootData = res.data;
                this.setState({ rootData });
                const archetypeUrl = res.data.archetypes + 'index.json';
                this.setState({archetypeUrl });
                this.didLoadComponent('root_data');
            });
        
            //Pool Power Sets call
        axios.get(this.server + this.poolPowerPath)
            .then(powRes => {
                const poolPowerSets = powRes.data.power_sets;
                this.setState({poolPowerSets});
                this.setPool1(poolPowerSets[0].name);
                this.setPool2(poolPowerSets[1].name);
                this.setPool3(poolPowerSets[2].name);
                this.setPool4(poolPowerSets[3].name);
                this.didLoadComponent('pool_data');
            });
        
        //Epic Power Sets call
        axios.get(this.server + this.epicPowerPath)
            .then(powRes => {
                const epicPowerSets = powRes.data.power_sets;
                this.setState({epicPowerSets});

                this.didLoadComponent('epic_data');

            })
    }

    /**
     * This is a way to see if the builder is completely loaded. The builder is completely loaded when:
     *  - The root data has been loaded from the server
     *  - The pool power data has been loaded from the server
     *  - Each of the pool powers has a default value and the data forr each default value is loaded.
     * @returns true if the app has completely loaded
     */
    isAppLoaded()
    {
        return (this.state.loaded_components.root_data &&
            this.state.loaded_components.pool_data &&
            this.state.loaded_components.toon_pool1_data &&
            this.state.loaded_components.toon_pool2_data &&
            this.state.loaded_components.toon_pool3_data &&
            this.state.loaded_components.toon_pool4_data)
    }


    /**
     * This function is used to savbe the character data for this toon to the local storage.
     * Currently can only save one toon, stored in the 'toon' local storage key
     */
    saveToon = () => {
        let toon =
            {
                toon_name: this.state.toon_name,
                toon_archetype: this.state.toon_archetype,
                toon_origin: this.state.toon_origin,
                toon_priPower: this.state.toon_priPower,
                toon_secPower: this.state.toon_secPower,
                toon_pool1: this.state.toon_pool1,
                toon_pool2: this.state.toon_pool2,
                toon_pool3: this.state.toon_pool3,
                toon_pool4: this.state.toon_pool4,
                toon_powers: this.state.toon_powers,
            };
        ls.set('toon', toon);
        this.setState({toon_saved: true});
    }

    /**
     * This function will save all the data for the current toon being built to local
     * storage under the 'toon' key. Only one toon save is possible now.
     */
    loadToon = () => {
        let toon = ls.get('toon') || {};
        this.setState({toon_name: toon.toon_name});
        this.setState({toon_archetype: toon.toon_archetype});
        this.setState({toon_origin: toon.toon_origin});
        this.setState({toon_priPower: toon.toon_priPower});
        this.setState({toon_secPower: toon.toon_secPower});
        this.setState({toon_pool1: toon.toon_pool1});
        this.setState({toon_pool2: toon.toon_pool2});
        this.setState({toon_pool3: toon.toon_pool3});
        this.setState({toon_pool4: toon.toon_pool4});
        this.setState({toon_powers: toon.toon_powers});
        if(toon.toon_name && (toon.toon_archetype || toon.toon_origin))
            this.setState({collapse_on_load: true});
    }

    /**
     * This is a handler for when the user selects an archetype.
     * @param {Object} archSel A JSON array of the saelected Archetype info from the API
     */
    handleArchetypeChange = (archSel) => {
        const toon_archetype = archSel;
        this.setState({toon_archetype})
        //update orgin possibilities
        this.state.possibleOrigins = archSel.allowed_origins;
        if(!this.state.toon_origin || this.state.possibleOrigins.indexOf(this.state.toon_origin) == -1)
            this.state.toon_origin = (this.state.possibleOrigins? this.state.possibleOrigins[0]: '');
        //update power sets
        let priPowerSet = this.state.rootData.power_categories.find(power => power.name.toLowerCase() == archSel.primary_category.toLowerCase());
        if(priPowerSet) {
            this.state.priPowerSetUrl = priPowerSet.url;
            axios.get(this.state.priPowerSetUrl)
                .then(powRes => {
                    const priPowerSets = powRes.data.power_sets;
                    this.setState({priPowerSets});
                    if(!this.state.toon_priPower || indexOfByName(this.state.priPowerSets, this.state.toon_priPower.name) == -1)
                        this.setPrimaryPowerSet(priPowerSets[0].name);
                    this.didLoadComponent('priPowerSets_data');
                })
        }
        let secPowerSet = this.state.rootData.power_categories.find(power => power.name.toLowerCase() == archSel.secondary_category.toLowerCase());
        if(secPowerSet)
        {
            this.state.secPowerSetUrl = secPowerSet.url;
            axios.get(this.state.secPowerSetUrl)
                .then(powRes => {
                    const secPowerSets = powRes.data.power_sets;
                    this.setState({secPowerSets});
                    if(!this.state.toon_secPower || indexOfByName(this.state.secPowerSets, this.state.toon_secPower.name) == -1)
                        this.setSecondaryPowerSet(secPowerSets[0].name);
                    this.didLoadComponent('secPowerSets_data');
                })
        }
    }

    /**
     * This is the handler when the user selects a primary power. Only the name is passed, since
     * we already have all the powers loaded in this.state.priPowerSets
     * @param {String} powerName The name of the power that we will be setting as primary
     */
    setPrimaryPowerSet = (powerName) => {
        let idx = indexOfByName(this.state.priPowerSets, powerName);
        if(idx != -1)
        {
            const powerSet = this.state.priPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => { 
                    const toon_priPower = Object.assign({}, res.data);
                    this.setState({toon_priPower});
                    this.didLoadComponent('toon_priPower_data');
                });
        }

    }

    /**
     * This is the handler when the user selects a secondary power. Only the name is passed, since
     * we already have all the powers loaded in this.state.secPowerSets
     * @param {String} powerName The name of the power that we will be setting as secondary
     */
    setSecondaryPowerSet = (powerName) => {
        let idx = indexOfByName(this.state.secPowerSets, powerName);
        if(idx != -1)
        {
            const powerSet = this.state.secPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_secPower = Object.assign({}, res.data);
                    this.setState({toon_secPower});
                    this.didLoadComponent('toon_secPower_data');
                });
        }
    }

    /**
     * Handler for toon Pool1.
     * @param {string} powerName 
     */
    setPool1 = (powerName) => {
        let idx = indexOfByName(this.state.poolPowerSets, powerName);
        if(idx != -1)
        {
            const powerSet = this.state.poolPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_pool1 = Object.assign({}, res.data);
                    this.setState({toon_pool1});
                    this.didLoadComponent('toon_pool1_data');
                });
        }
    }

    /**
     * Handler for toon Pool2.
     * @param {string} powerName 
     */
    setPool2 = (powerName) => {
        let idx = indexOfByName(this.state.poolPowerSets, powerName);
        if(idx != -1)
        {
            const powerSet = this.state.poolPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_pool2 = Object.assign({}, res.data);
                    this.setState({toon_pool2});
                    this.didLoadComponent('toon_pool2_data');
                });
        }
    }

    /**
     * Handler for toon Pool3.
     * @param {string} powerName 
     */
    setPool3 = (powerName) => {
        let idx = indexOfByName(this.state.poolPowerSets, powerName);
        if(idx != -1)
        {
            const powerSet = this.state.poolPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_pool3 = Object.assign({}, res.data);
                    this.setState({toon_pool3});
                    this.didLoadComponent('toon_pool3_data');
                });
        }
    }

    /**
     * Handler for toon Pool4.
     * @param {string} powerName 
     */
    setPool4 = (powerName) => {
        let idx = indexOfByName(this.state.poolPowerSets, powerName);
        if(idx != -1)
        {
            const powerSet = this.state.poolPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_pool4 = Object.assign({}, res.data);
                    this.setState({toon_pool4});
                    this.didLoadComponent('toon_pool4_data');
                });
        }
    }

    render() {
        let loaded_data = ls.get('toon') || {};
        let has_data = (Object.keys(loaded_data).length > 0);
        let load_btn;
        if(has_data)
        {
            load_btn = (
                <p className="control">
                    <button 
                        type="button" 
                        className="button is-light is-info is-small" 
                        onClick={this.loadToon}
                    >Load Character {loaded_data.toon_name}</button>
                </p>
            );
        }
        //collapse menu

        let collapse;
        if(this.state.info_collapsed)
            collapse = <a href="#" className="small ml-5" onClick={() => this.setState({info_collapsed: false})}>[show pool sets]</a>;
        else
            collapse = <a href="#" className="small ml-5" onClick={() => this.setState({info_collapsed: true})}>[collapse]</a>;
        return (
            <div className="container has-background-black has-text-white-ter p-3">
                <div className="is-flex is-justify-content-space-between is-align-items-center">
                    <div className="block title is-2 has-text-left has-text-white-ter">
                        {this.state.toon_name}: {this.state.toon_origin} {this.state.toon_archetype.display_name}
                        ({this.state.toon_archetype && this.state.toon_priPower.display_name} / {this.state.toon_archetype && this.state.toon_secPower.display_name})
                    </div>

                    {this.state.toon_saved && (
                        <div className="notification is-info is-light is-size-6 p-2 longer has-text-left">
                            <button class="delete"></button>
                            Toon Saved!
                        </div>
                    )}

                    <div className="field is-grouped">
                        <p className="control">
                            <button 
                                type="button" 
                                className="button is-light is-primary is-small" 
                                onClick={this.saveToon}
                            >Save Character</button>
                        </p>
                        {load_btn}
                    </div>
                </div>
                <div className="columns is-gapless">
                    <div className="column">

                        <div className="field has-addons has-addons-centered">
                            <p className="control">
                                <span className="button is-static is-small">Name: </span>
                            </p>
                            <p className="control">
                                <input
                                    type="text"
                                    className="input is-small "
                                    placeholder="Character Name"
                                    aria-label="Character Name"
                                    aria-describedby="character-name"
                                    value={this.state.toon_name}
                                    onChange={(e) => this.setState({toon_name: e.target.value})}
                                />
                            </p>
                        </div>

                        <ArchetypeSelector 
                                    archetypeUrl={this.state.archetypeUrl} 
                                    onSelectArchetype={this.handleArchetypeChange} 
                                    selectedArchetype={this.state.toon_archetype} />

                        <div className="field has-addons has-addons-centered">
                            <p className="control">
                                <span className="button is-static is-small">Origin:</span>
                            </p>
                            <div className="control">
                                <div className="select is-small">
                                    <select
                                        className="is-small"
                                        id="origin-select"
                                        value={this.state.toon_origin}
                                        onChange={(e) => this.setState({toon_origin: e.target.value})}
                                    >
                                        { this.state.possibleOrigins.map(
                                            (origin) =>
                                                <option value={origin} key={origin} >{origin}</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="columns is-gapless">
                            <div className="column">
                                <div className="field">
                                    <label className="label has-text-white-ter">Primary Power Set: </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img src={this.state.toon_priPower? this.state.toon_priPower.icon: ''} />
                                        </div>
                                        <div className="select">
                                            <select
                                                id="pri-pow-select"
                                                value={this.state.toon_priPower.name}
                                                onChange={(e) => this.setPrimaryPowerSet(e.target.value)} >

                                                { this.state.priPowerSets.map(
                                                    (powerSet) =>
                                                        <option value={powerSet.name} key={powerSet.name} >{powerSet.display_name}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field">
                                    <label className="label has-text-white-ter">Secondary Power Set: </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small mr-2">
                                            <img src={this.state.toon_secPower? this.state.toon_secPower.icon: ''} />
                                        </div>
                                        <div className="select">
                                            <select
                                                id="sec-pow-select"
                                                value={this.state.toon_secPower.name}
                                                onChange={(e) => this.setSecondaryPowerSet(e.target.value)} >

                                                { this.state.secPowerSets.map(
                                                    (powerSet) =>
                                                        <option value={powerSet.name} key={powerSet.name} >{powerSet.display_name}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="columns is-gapless">
                            <div className="column">
                                <div className="field p-1">
                                    <label className="label has-text-white-ter is-flex is-justify-content-center">
                                        Pool 1
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img src={this.state.toon_priPower? this.state.toon_pool1.icon: ''} />
                                        </div>
                                        <div className="select">
                                            <select
                                                value={this.state.toon_pool1.name}
                                                onChange={(e) => this.setPool1(e.target.value)} >

                                                { this.state.poolPowerSets.map(
                                                    (powerSet) =>
                                                        <option value={powerSet.name} key={powerSet.name} >{powerSet.display_name}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field p-1">
                                    <label className="label has-text-white-ter is-flex is-justify-content-center">
                                        Pool 2
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img src={this.state.toon_priPower? this.state.toon_pool2.icon: ''} />
                                        </div>
                                        <div className="select">
                                            <select
                                                value={this.state.toon_pool2.name}
                                                onChange={(e) => this.setPool2(e.target.value)} >

                                                { this.state.poolPowerSets.map(
                                                    (powerSet) =>
                                                        <option value={powerSet.name} key={powerSet.name} >{powerSet.display_name}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="columns is-gapless">
                            <div className="column">
                                <div className="field p-1">
                                    <label className="label has-text-white-ter is-flex is-justify-content-center">
                                        Pool 3
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img src={this.state.toon_priPower? this.state.toon_pool3.icon: ''} />
                                        </div>
                                        <div className="select">
                                            <select
                                                value={this.state.toon_pool3.name}
                                                onChange={(e) => this.setPool3(e.target.value)} >

                                                { this.state.poolPowerSets.map(
                                                    (powerSet) =>
                                                        <option value={powerSet.name} key={powerSet.name} >{powerSet.display_name}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field p-1">
                                    <label className="label has-text-white-ter is-flex is-justify-content-center">
                                        Pool 4
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img src={this.state.toon_priPower? this.state.toon_pool4.icon: ''} />
                                        </div>
                                        <div className="select">
                                            <select
                                                className="custom-select"
                                                id="pool4-pow-select"
                                                value={this.state.toon_pool4.name}
                                                onChange={(e) => this.setPool4(e.target.value)} >

                                                { this.state.poolPowerSets.map(
                                                    (powerSet) =>
                                                        <option value={powerSet.name} key={powerSet.name} >{powerSet.display_name}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="column">
                        <PowerAssigner
                            priPowerSet={this.state.toon_priPower}
                            secPowerSet={this.state.toon_secPower}
                            pool1PowerSet={this.state.toon_pool1}
                            pool2PowerSet={this.state.toon_pool2}
                            pool3PowerSet={this.state.toon_pool3}
                            pool4PowerSet={this.state.toon_pool4}
                            applyPowers={this.state.toon_powers}
                            onUpdatePowers={ (toon_powers) => this.setState({toon_powers}) }
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default CharacterBuilder;

//ReactDOM.render(<CharacterBuilder />, document.getElementById('coh-builder'))

