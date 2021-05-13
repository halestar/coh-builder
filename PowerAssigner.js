import React, { Component } from 'react';
import axios from "axios";
import {getByLevel, indexOfByName, logObj} from "./Helpers";
import PowerSelector from "./PowerSelector";
import PowerInfo from "./PowerInfo";

class PowerAssigner extends Component {

    /**
     * the following props will be used:
     * priPowerSet
     * secPowerSet
     * pool1PowerSet
     * pool2PowerSet
     * pool3PowerSet
     * pool4PowerSet
     */

    constructor(props) {
        super(props)
        this.server = "http://localhost/api/coh/";
        this.state = {
            availablePowers: [],
            powerSelectorPowers: null,
            powerSelectorLevel: null,
            toon_level1SecPower: {},
            toon_powers:[],

            show_info: false,
        };
    }

    isPriPower(powerName) {
        return (indexOfByName(this.props.priPowerSet.powers, powerName) != -1);
    }

    isSecPower(powerName) {
        return (indexOfByName(this.props.secPowerSet, powerName) != -1);
    }

    isPoolPower(powerName) {
        return powerName.startsWith('Pool.');
    }

    componentDidMount() {
        this.updateAvailablePowers();
        let powerTemplate = {
            name: '',
            power: {},
            enhancements: [{
                level: 0,
                name: '',
            }]
        }
        let toon_powers = [Object.assign({level: 1}, powerTemplate)];
        for(var i = 1; i <= 16; i++)
            toon_powers.push(Object.assign({level: (i *2)}, powerTemplate));
        toon_powers.push(Object.assign({level: 35}, powerTemplate));
        toon_powers.push(Object.assign({level: 38}, powerTemplate));
        toon_powers.push(Object.assign({level: 41}, powerTemplate));
        toon_powers.push(Object.assign({level: 44}, powerTemplate));
        toon_powers.push(Object.assign({level: 47}, powerTemplate));
        toon_powers.push(Object.assign({level: 49}, powerTemplate));
        if(this.props.applyPowers && toon_powers.length === this.props.applyPowers.length )
            this.setState({toon_powers: this.props.applyPowers});
        else
            this.setState({toon_powers});
    }

    componentDidUpdate(prevProps) {
        if(this.props.priPowerSet.name && prevProps.priPowerSet.name != this.props.priPowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.secPowerSet.name && prevProps.secPowerSet.name != this.props.secPowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.pool1PowerSet.name && prevProps.pool1PowerSet.name != this.props.pool1PowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.pool2PowerSet.name && prevProps.pool2PowerSet.name != this.props.pool2PowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.pool3PowerSet.name && prevProps.pool3PowerSet.name != this.props.pool3PowerSet.name)
            this.updateAvailablePowers();
        else if(this.props.pool4PowerSet.name && prevProps.pool4PowerSet.name != this.props.pool4PowerSet.name)
            this.updateAvailablePowers();

        if(this.props.applyPowers &&
            this.props.applyPowers.length == this.state.toon_powers.length
            && this.props.applyPowers != prevProps.applyPowers){
            this.setState({toon_powers: this.props.applyPowers});
        }
    }

    updateAvailablePowers(){
        //merge all the power sets
        let allPowers = [];
        if(this.props.priPowerSet.powers)
            allPowers = [...allPowers, ...this.props.priPowerSet.powers];
        if(this.props.secPowerSet.powers)
            allPowers = [...allPowers, ...this.props.secPowerSet.powers];
        if(this.props.pool1PowerSet.powers)
            allPowers = [...allPowers, ...this.props.pool1PowerSet.powers];
        if(this.props.pool2PowerSet.powers)
            allPowers = [...allPowers, ...this.props.pool2PowerSet.powers];
        if(this.props.pool3PowerSet.powers)
            allPowers = [...allPowers, ...this.props.pool3PowerSet.powers];
        if(this.props.pool4PowerSet.powers)
            allPowers = [...allPowers, ...this.props.pool4PowerSet.powers];

        let set = new Set();
        let availablePowers = allPowers.filter(item => {
            if(indexOfByName(this.state.toon_powers, item.name) != -1)
                return false
            if (!set.has(item.name)) {
                set.add(item.name);
                return true;
            }
            return false;
        }, set);

        //also, we can fill in the toon_level1SecPower since it will be the only possible power from the secondary power set
        if(this.props.secPowerSet.powers) {
            let possibleSecondary = this.props.secPowerSet.powers.find(power => power.available_at_level <= 1);
            if (possibleSecondary && Object.keys(possibleSecondary).length > 0) {
                this.setState({toon_level1SecPower: possibleSecondary});
                //remove the secondary power from available
                let secIdx = indexOfByName(availablePowers, possibleSecondary.name);
                if(secIdx != -1)
                    availablePowers.splice(secIdx, 1);
            }
        }

        this.setState({availablePowers: availablePowers});
    }



    powerMeetsReq(power, level) {
        let i = 0;
        let stms = '';
        while(i < this.state.toon_powers.length && this.state.toon_powers[i].level <= level)
        {
            if(this.state.toon_powers[i].name != '') {
                stms = stms + 'let ' + this.state.toon_powers[i].name.replaceAll('.', '_') + '=true; ';
            }
            i++;
        }

        let requirements =  power.requires.replaceAll('.', '_');
        const regex = /[a-zA-z_]+/ig;
        let jsReqs = requirements.replaceAll(regex, "(typeof $&  !== 'undefined')");
        let fn = "(function() { " + stms + " return " + jsReqs + "; })()";
        try {
            let meetReqs = eval(fn);
            return meetReqs;
        }
        catch (e) {
            console.log('refence error!');
        }
        return true;
    }

    selectPower = (level) => {
        let powerSelectorPowers = this.state.availablePowers.filter(item => {
            if(item.available_at_level > level)
                return false;
            if(this.isPoolPower(item.name) && level < 4)
                return false;
            let idx = indexOfByName(this.state.toon_powers, item.name);
            if( idx != -1 && this.state.toon_powers[idx].level < level)
                return false;
            if(item.requires)
                return this.powerMeetsReq(item, level)
            return true;
        });
        this.setState({powerSelectorPowers});
        this.setState({powerSelectorLevel: level});
    }

    handleSelectedPower = (power) => {
        let power_name = power.name;
        let toon_powers = this.state.toon_powers.slice();
        let lv = getByLevel(toon_powers, this.state.powerSelectorLevel);
        if(lv) {
            lv.name = power_name;
            lv.power = power;
            lv.enhancements[0].level = this.state.powerSelectorLevel;
            this.setState(toon_powers);
            this.setState({powerSelectorLevel: null});
            if (this.props.onUpdatePowers)
                this.props.onUpdatePowers(toon_powers);
        }
    }

    renderPower(levelAssignments) {

        let name;
        let divClass = ".power-selector-empty";
        let badge = <span className="badge badge-pill badge-warning align-self-center">POOL</span>;
        let powerSelected = false;
        if(levelAssignments.name == '') {

            name = <a href="#" className="text-dark" onClick={() => this.selectPower(levelAssignments.level)}>Select
                Power</a>;
            divClass = "power-selector-empty";
            badge = <span>&nbsp;</span>;
        }
        else {
            powerSelected = true;
            name = <a href="#" className="text-dark"
                      onClick={() => this.selectPower(levelAssignments.level)}>{levelAssignments.power.display_name}</a>;
            divClass = "power-selector";
            if(this.isPriPower(levelAssignments.name))
                badge = <span className="badge badge-pill badge-primary align-self-center">PRI</span>;
            else if(this.isSecPower(levelAssignments.name))
                badge = <span className="badge badge-pill badge-secondary align-self-center">SEC</span>;
        }

        if(this.state.powerSelectorLevel == levelAssignments.level)
            divClass = "power-selector-selected";

        return (
            <div
                className={divClass}
                key={levelAssignments.level}
                onMouseEnter={() => this.setState({show_info: (powerSelected? levelAssignments.power: false) })}
                onMouseLeave={() => this.setState({show_info:false})}
            >
                <span>({levelAssignments.level == 0? 1: levelAssignments.level})</span> <span className="power-selector-name">{name}</span> {badge}
            </div>
        )
    }

    render() {
        let pow = getByLevel(this.state.toon_powers, this.state.powerSelectorLevel);
        let powerSelected = '';
        if(pow && pow.power)
            powerSelected = pow.power.name;
        return (
            <div className="row">
                <div className="col col-8 d-flex flex-wrap">
                    {this.renderPower({level: "0", name: this.state.toon_level1SecPower.name, power: this.state.toon_level1SecPower})}
                    { this.state.toon_powers.map(
                        (levelAssignments) =>
                            this.renderPower(levelAssignments)
                    )}
                </div>

                <div className="power-assigner-column">
                    {this.state.powerSelectorLevel && (
                    <PowerSelector
                        availablePowers={this.state.powerSelectorPowers}
                        powerSelected={powerSelected}
                        powerSets={ {
                            priPowerSet: this.props.priPowerSet,
                            secPowerset: this.props.secPowerSet,
                            pool1: this.props.pool1PowerSet,
                            pool2: this.props.pool2PowerSet,
                            pool3: this.props.pool3PowerSet,
                            pool4: this.props.pool4PowerSet,
                        } }
                        onSelectedPower={this.handleSelectedPower}
                    />
                    )}
                    {!this.state.powerSelectorLevel && this.state.show_info && (
                        <PowerInfo
                            power={this.state.show_info}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default PowerAssigner;
