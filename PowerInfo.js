import React, { Component } from 'react';
import axios from "axios";
import {indexOfByName, logObj} from "./Helpers";

class PowerInfo extends Component {

    /**
     * the following props will be used:
     * power - the selected power to show info about
     */
    constructor(props) {
        super(props)
        this.state = {
            power: null,
        };
    }

    componentDidMount() {
        this.setState({power: this.props.power});
    }

    render() {
        if(!this.state.power)
            return (<div>Error</div>);
        return (
            <div className="p-3 border border-info bg-info">
                <div className="border-bottom text-center font-weight-bold">
                    {this.state.power.display_name}
                </div>
                <div className="border-bottom">{this.state.power.display_short_help}</div>
                <div className="border-bottom">{this.state.power.display_help}</div>
                { this.state.power.display_info && this.state.power.display_info.lengh > 0 && 
                    <div className="row">
                        <div className="col col-6">
                            <dl className="row small">
                                <dt className="col-sm-6">{this.state.power.display_info['Endurance Cost']? "End Cost": " "}</dt>
                                <dd className="col-sm-6">{this.state.power.display_info['Endurance Cost']? this.state.power.display_info['Endurance Cost']: " "}.</dd>

                                <dt className="col-sm-6">{this.state.power.display_info['Recharge Time']? "Recharge": " "}</dt>
                                <dd className="col-sm-6">{this.state.power.display_info['Recharge Time']? this.state.power.display_info['Endurance Cost']: " "}.</dd>

                                <dt className="col-sm-6">{this.state.power.display_info['Power Range']? "Range": " "}</dt>
                                <dd className="col-sm-6">{this.state.power.display_info['Power Range']? this.state.power.display_info['Endurance Cost']: " "}.</dd>

                                <dt className="col-sm-6">{this.state.power.display_info['Activation Time']? "Cast": " "}</dt>
                                <dd className="col-sm-6">{this.state.power.display_info['Activation Time']? this.state.power.display_info['Endurance Cost']: " "}.</dd>
                            </dl>
                        </div>
                        <div className="col col-6">

                        </div>
                    </div>
                }
            </div>
        );
    }

}

export default PowerInfo;
