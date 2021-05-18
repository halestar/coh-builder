import React, { Component } from 'react';
import axios from "axios";
import ArchetypeSelector from "./ArchetypeSelector";
import {indexOfByName, logObj} from './Helpers';
import PowerSelector from "./PowerSelector";
import ls from 'local-storage';
import 'bulma/css/bulma.min.css';
import './coh-builder.scss';
import cloneDeep from 'lodash/cloneDeep';
import PowerWidget from './PowerWidget';
import ToonPowers from './ToonPowers';
import ToonPowerSets from './ToonPowerSets';


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
        this.epicPowerPath = "epic/index.json";
        this.fitnessPowerPath = "inherent/fitness/index.json";
        this.inherentPowerPath = "inherent/inherent/index.json";
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

            // epicPowerSets is the list of all possible epic powers
            epicPowerSets: [],

            // availableEpicPowerSets is list of all the epic powers the toon has available based on their archetype
            availableEpicPowerSets: [],

            //all inherent power sets
            inherentPowerSets: [],


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
            toon_epic: {},
            //we get this from the actual builder part
            toon_powers: new ToonPowers(),



            select_power_level: null,
            toon_saved: false,
        };
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
            });
        
        //Epic Power Sets call
        axios.get(this.server + this.epicPowerPath)
            .then(powRes => {
                const epicPowerSets = powRes.data.power_sets;
                this.setState({epicPowerSets});
                let self = this;
                for(var i = 0; i < epicPowerSets.length; i++)
                {
                    axios.get(epicPowerSets[i].url + "index.json")
                            .then(powRes => {
                                self.loadEpicPower(powRes.data);
                            });
                }
                
            })

        //Fitness  power sets
        axios.get(this.server + this.fitnessPowerPath)
            .then(res => {
                const fitnessPowerSets = res.data;
                this.state.toon_powers.setFitnessPowers(fitnessPowerSets.powers);
            });

        //Inherent  power sets
        axios.get(this.server + this.inherentPowerPath)
        .then(res => {
            const inherentPowerSets = res.data;
            this.setState({ inherentPowerSets });
            this.determineInherentPowers();
        });

    }

    isEpicLoaded()
    {
        for(var i = 0; i < this.state.epicPowerSets.length; i++)
        {
            if(typeof this.state.epicPowerSets[i].display_help === 'undefined' || this.state.epicPowerSets[i].display_help === '')
                return false;
        }
        return true;
    }

    loadEpicPower(powerSet)
    {
        //first, find the place where to replace it.
        let idx = indexOfByName(this.state.epicPowerSets, powerSet.name);
        if(idx !== -1)
        {
            this.state.epicPowerSets[idx] = cloneDeep(powerSet);
            if(this.isEpicLoaded())
                this.determineEpicPools();
        }
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
                toon_epic: this.state.toon_epic,
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
        this.setState({toon_powers: ToonPowers.load(toon.toon_powers)});
        this.setState({toon_epic: toon.toon_epic});
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
        if(!this.state.toon_origin || this.state.possibleOrigins.indexOf(this.state.toon_origin) === -1)
            this.state.toon_origin = (this.state.possibleOrigins? this.state.possibleOrigins[0]: '');
        //update power sets
        let priPowerSet = this.state.rootData.power_categories.find(power => power.name.toLowerCase() === archSel.primary_category.toLowerCase());
        if(priPowerSet) {
            this.state.priPowerSetUrl = priPowerSet.url;
            axios.get(this.state.priPowerSetUrl)
                .then(powRes => {
                    const priPowerSets = powRes.data.power_sets;
                    this.setState({priPowerSets});
                    if(!this.state.toon_priPower || indexOfByName(this.state.priPowerSets, this.state.toon_priPower.name) === -1)
                        this.setPrimaryPowerSet(priPowerSets[0].name);
                })
        }
        let secPowerSet = this.state.rootData.power_categories.find(power => power.name.toLowerCase() === archSel.secondary_category.toLowerCase());
        if(secPowerSet)
        {
            this.state.secPowerSetUrl = secPowerSet.url;
            axios.get(this.state.secPowerSetUrl)
                .then(powRes => {
                    const secPowerSets = powRes.data.power_sets;
                    this.setState({secPowerSets});
                    if(!this.state.toon_secPower || indexOfByName(this.state.secPowerSets, this.state.toon_secPower.name) === -1)
                        this.setSecondaryPowerSet(secPowerSets[0].name);
                })
        }
        //also, update epic pools
        this.determineEpicPools();
        this.determineInherentPowers();
        
        //check to see if we;re not setting the same as the old one, if it's different delete the powers.
        if(this.state.toon_archetype.name !== archSel.name)
            this.state.toon_powers.clearPowers();
    }

    /**
     * This function will determine the sets of Epic Power Sets that the user
     * has available to assign to their toon. THe set is based on the archetype selected.
     */
    determineEpicPools()
    {
        if(this.state.toon_archetype)
        {
            let availableEpicPowerSets = [];
            let archName = this.state.toon_archetype.name;
            this.state.epicPowerSets.forEach(
                (powerSet) =>
                    {
                        //first, extract the class from the first epic power.
                        let reqClass = powerSet.powers[0].requires;
                        let matches = [...reqClass.matchAll(/@Class_([a-zA-Z_]+)/g)];
                        let inClass = false;
                        for(var i = 0; i < matches.length; i++)
                        {
                            if(matches[i][1] === archName)
                            {
                                inClass = true;
                                break;
                            }
                        }
                        if(inClass)
                            availableEpicPowerSets.push(powerSet);
                    }
            );
            this.setState({availableEpicPowerSets});
            if(availableEpicPowerSets && availableEpicPowerSets.length > 0)
            {
                //we have at least one epic pwer available. do we have one already set? If not use the frst one
                if(this.state.toon_epic && this.state.toon_epic.name !== '')
                {
                    //we have one set, but is it a valid one? if not, set the first available one.
                    if(indexOfByName(availableEpicPowerSets, this.state.toon_epic.name) === -1)
                        this.setState({toon_epic: availableEpicPowerSets[0]});
                }
                else
                   this.setState({toon_epic: availableEpicPowerSets[0]});
            }
        }
    }

    determineInherentPowers()
    {
        if(this.state.inherentPowerSets && this.state.inherentPowerSets.powers && this.state.inherentPowerSets.powers.length > 0)
        {
            let availableInherentPowers = this.state.inherentPowerSets.powers.filter(
                (item) => 
                {
                    /**
                     * this checks for the class only. However, look at Brute and it has 4 differnt Fury's, which have to be
                     * reduced. No idea how yet.
                    if(this.state.toon_archetype && 
                        this.state.toon_archetype.name && 
                        typeof item.requires === "string")
                    {
                        let re = new RegExp('\\$archetype == @Class_' + this.state.toon_archetype.name);
                        if(item.requires.match(re) !== null)
                            return true;
                    }*/
                    if(!item.hasOwnProperty('enhancements_allowed') || item.enhancements_allowed.length === 0)
                        return false;
                    if(item.name === "Inherent.Inherent.Sprint" || item.name === "Inherent.Inherent.Rest" || item.name === "Inherent.Inherent.Brawl")
                        return true;
                    return false;
                }
            );
            //let toon_powers = this.state.toon_powers.clone();
            this.state.toon_powers.setInherentPowers(availableInherentPowers);
            //this.setState(toon_powers);
        }
    }

    /**
     * This is the handler when the user selects a primary power. Only the name is passed, since
     * we already have all the powers loaded in this.state.priPowerSets
     * @param {String} powerName The name of the power that we will be setting as primary
     */
    setPrimaryPowerSet = (powerName) => {
        let idx = indexOfByName(this.state.priPowerSets, powerName);
        if(idx !== -1)
        {
            const powerSet = this.state.priPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => { 
                    const toon_priPower = Object.assign({}, res.data);
                    this.setState({toon_priPower});
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
        if(idx !== -1)
        {
            const powerSet = this.state.secPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_secPower = Object.assign({}, res.data);
                    this.state.toon_powers.determineSecondaryPower(toon_secPower);
                    this.setState({toon_secPower});
                });
        }
    }

    /**
     * Handler for toon Pool1.
     * @param {string} powerName 
     */
    setPool1 = (powerName) => {
        let idx = indexOfByName(this.state.poolPowerSets, powerName);
        if(idx !== -1)
        {
            const powerSet = this.state.poolPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_pool1 = Object.assign({}, res.data);
                    this.setState({toon_pool1});
                });
        }
    }

    /**
     * Handler for toon Pool2.
     * @param {string} powerName 
     */
    setPool2 = (powerName) => {
        let idx = indexOfByName(this.state.poolPowerSets, powerName);
        if(idx !== -1)
        {
            const powerSet = this.state.poolPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_pool2 = Object.assign({}, res.data);
                    this.setState({toon_pool2});
                });
        }
    }

    /**
     * Handler for toon Pool3.
     * @param {string} powerName 
     */
    setPool3 = (powerName) => {
        let idx = indexOfByName(this.state.poolPowerSets, powerName);
        if(idx !== -1)
        {
            const powerSet = this.state.poolPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_pool3 = Object.assign({}, res.data);
                    this.setState({toon_pool3});
                });
        }
    }

    /**
     * Handler for toon Pool4.
     * @param {string} powerName 
     */
    setPool4 = (powerName) => {
        let idx = indexOfByName(this.state.poolPowerSets, powerName);
        if(idx !== -1)
        {
            const powerSet = this.state.poolPowerSets[idx];
            axios.get(powerSet.url + "index.json")
                .then(res => {
                    const toon_pool4 = Object.assign({}, res.data);
                    this.setState({toon_pool4});
                });
        }
    }

    /**
     * Handler for toon Epic Power.
     * @param {string} powerName 
     */
     setEpicPower = (powerName) => {
        let idx = indexOfByName(this.state.epicPowerSets, powerName);
        if(idx !== -1)
            this.setState({toon_epic: this.state.epicPowerSets[idx]});
    }

    handlePowerSelect = (powerAssignment) => {

        if(powerAssignment.level === 0)
            alert("You can't change your first secondary power!")
        else
            this.setState({select_power_level: powerAssignment.level})
    }

    handleAssignPower = (power) => {
        if(this.state.select_power_level >= 0)
        {
            let toon_powers = this.state.toon_powers.clone();
            toon_powers.assignLevelPower(this.state.select_power_level, power);
            this.setState({toon_powers});
            this.setState({select_power_level: null});
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
        return (
            <div className="container has-background-black has-text-white-ter p-3">
                <div className="is-flex is-justify-content-space-between is-align-items-center">
                    <div className="block title is-3 has-text-left has-text-white-ter">
                        {this.state.toon_name}: {this.state.toon_origin} {this.state.toon_archetype.display_name} &nbsp;
                        ({this.state.toon_archetype && this.state.toon_priPower.display_name} / {this.state.toon_archetype && this.state.toon_secPower.display_name})
                    </div>

                    {this.state.toon_saved && (
                        <div className="notification is-info is-light is-size-6 p-2 longer has-text-left">
                            <button className="delete" onClick={() => this.setState({toon_saved: false}) }></button>
                            Toon Saved!
                        </div>
                    )}

                    <div className="field is-grouped">
                        {this.state.toon_name &&
                        <p className="control">
                            <button 
                                type="button" 
                                className="button is-light is-primary is-small" 
                                onClick={this.saveToon}
                            >Save Character</button>
                        </p>
                        }
                        {load_btn}
                    </div>
                </div>
                
                <hr />

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
                                    <label className="label has-text-white-ter">Primary Power Set</label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img 
                                                src={this.state.toon_priPower? this.state.toon_priPower.icon: ''} 
                                                alt={this.state.toon_priPower? this.state.toon_priPower.display_name: ''} 
                                            />
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
                                    <label className="label has-text-white-ter">Secondary Power Set</label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small mr-2">
                                            <img 
                                                src={this.state.toon_secPower? this.state.toon_secPower.icon: ''} 
                                                alt={this.state.toon_secPower? this.state.toon_secPower.display_name: ''} 
                                            />
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
                                    <label className="label has-text-white-ter">
                                        Pool 1
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img 
                                                src={this.state.toon_priPower? this.state.toon_pool1.icon: ''} 
                                                alt={this.state.toon_priPower? this.state.toon_pool1.display_name: ''} 
                                            />
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
                                    <label className="label has-text-white-ter">
                                        Pool 2
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img 
                                                src={this.state.toon_priPower? this.state.toon_pool2.icon: ''} 
                                                alt={this.state.toon_priPower? this.state.toon_pool2.display_name: ''} 
                                            />
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
                                    <label className="label has-text-white-ter">
                                        Pool 3
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img 
                                                src={this.state.toon_priPower? this.state.toon_pool3.icon: ''} 
                                                alt={this.state.toon_priPower? this.state.toon_pool3.display_name: ''} 
                                            />
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
                                    <label className="label has-text-white-ter">
                                        Pool 4
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img 
                                                src={this.state.toon_priPower? this.state.toon_pool4.icon: ''} 
                                                alt={this.state.toon_priPower? this.state.toon_pool4.display_name: ''} 
                                            />
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

                        <div className="columns is-gapless">
                            <div className="column">
                                <div className="field p-1">
                                    <label className="label has-text-white-ter">
                                        Epic Pool
                                    </label>
                                    <div className="control has-icons-left">
                                        <div className="icon is-small ml-1">
                                            <img 
                                                src={this.state.toon_epic? this.state.toon_epic.icon: ''} 
                                                alt={this.state.toon_epic? this.state.toon_epic.display_name: ''} 
                                            />
                                        </div>
                                        <div className="select">
                                            <select
                                                value={this.state.toon_epic.name}
                                                onChange={(e) => this.setEpicPower(e.target.value)} >

                                                { this.state.availableEpicPowerSets.map(
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
                    {this.state.select_power_level !== null && 
                        <div className="selector-container">
                            <PowerSelector
                                toon_powers={this.state.toon_powers}
                                powerSets={
                                    new ToonPowerSets({
                                        primary: this.state.toon_priPower,
                                        secondary: this.state.toon_secPower,
                                        pool1: this.state.toon_pool1,
                                        pool2: this.state.toon_pool2,
                                        pool3: this.state.toon_pool3,
                                        pool4: this.state.toon_pool4,
                                        epic: this.state.toon_epic,
                                    })
                                }
                                level={this.state.select_power_level}
                                onPowerSelected={this.handleAssignPower}
                            />
                        </div>
                    }
                        <div className="columns">
                            <div className="column">
                                    { this.state.toon_powers.levelPowers.slice(0, 8).map(
                                        (powerAssigment) =>
                                        <div className="assigned-power-container">
                                            <PowerWidget 
                                                powerAssigment={powerAssigment}
                                                onPowerSelect={this.selectPower}
                                                key={powerAssigment.name}
                                                onPowerSelect={this.handlePowerSelect}
                                            />
                                        </div>
                                    )}
                            </div>
                            
                            <div className="column">
                                    { this.state.toon_powers.levelPowers.slice(8, 16).map(
                                        (powerAssigment) =>
                                        <div className="assigned-power-container">
                                            <PowerWidget 
                                                powerAssigment={powerAssigment}
                                                onPowerSelect={this.selectPower}
                                                key={powerAssigment.name}
                                                onPowerSelect={this.handlePowerSelect}
                                            />
                                        </div>
                                    )}
                            </div>
                            
                            <div className="column">
                                    { this.state.toon_powers.levelPowers.slice(16, 24).map(
                                        (powerAssigment) =>
                                        <div className="assigned-power-container">
                                            <PowerWidget 
                                                powerAssigment={powerAssigment}
                                                onPowerSelect={this.selectPower}
                                                key={powerAssigment.name}
                                                onPowerSelect={this.handlePowerSelect}
                                            />
                                        </div>
                                    )}
                            </div>
                        </div>
                        <hr />
                        <div className="columns">
                            <div className="column">
                                <section className="fitness-container">
                                    <div className="fitness-header">Fitness Powers</div>
                                    {this.state.toon_powers.fitnessPowers.map(
                                        (powerAssigment) => 
                                        <div className="assigned-power-container">
                                            <PowerWidget key={powerAssigment.name} powerAssigment={powerAssigment} />
                                        </div>
                                    )}
                                </section>
                            </div>
                            <div className="column">
                                {this.state.toon_powers.inherentPowers.map(
                                    (powerAssigment) => 
                                    <div className="assigned-power-container">
                                        <PowerWidget powerAssigment={powerAssigment}  key={powerAssigment.name} />
                                    </div>
                                )}
                            </div>
                            <div className="column">
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CharacterBuilder;
