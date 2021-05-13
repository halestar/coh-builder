import React, { Component } from 'react';
import axios from "axios";
import {indexOfByName, logObj} from "./Helpers";

/**
 * This components is responsible for selecting the Archetype of the toon, and then calling the API
 * to get the full information about the archetype, including primary and secondary powers, 
 * origins, etc. This Object should be passed the basic data and server and should send a callback
 * back to the builder with the archetype that was selected.
 */
class ArchetypeSelector extends Component {

    /**
     * 
     * @param {Object} props The properties being passed.  The following properties are used:
     *  - archetypeUrl: The URL used to get all the Archetypes.
     *  - selectedArchetype: A specific selected Archetype to load. Used when loading from memory.
     *  - onSelectArchetype: callback function when the user selectes an archetype
     */
    constructor(props) {
        super(props)
        this.state = {
            archetypes: [],
            selectedArchetype: {}
        };
    }

    /**
     * When the compopnent is loaded, the only thing we have to do is reload all the archetypes, but only if
     * we have a valid URL
     */
    componentDidMount() {
        if(this.props.archetypeUrl && this.props.archetypeUrl != "") {
            this.loadArchetypes();
        }
    }

    /**
     * We will be listening for 2 properties changes:
     * 1) If the Archetype URL changed, we need to reload the archetypes
     * 2) If the selected Archetype was changed, that means that we probably loaded a character, and we need to set the archetype.
     * @param {Object} prevProps An object containing the previous properties before one was changed.
     */
    componentDidUpdate(prevProps) {
        if(this.props.archetypeUrl && this.props.archetypeUrl != "" && this.props.archetypeUrl != prevProps.archetypeUrl) {
            this.loadArchetypes();
        }
        if(this.props.selectedArchetype && this.props.selectedArchetype != prevProps.selectedArchetype)
        {
            this.setArchetype(this.props.selectedArchetype.name);
        }
    }

    /**
     * This function queries the API for a list of all the archetypes in the system.
     */
    loadArchetypes(){
        axios.get(this.props.archetypeUrl)
            .then(archRes => {
                const archetypes = archRes.data.archetypes;
                this.setState({archetypes});
            })
    }

    /**
     * Once the archetype is selected, we setit as selected and transfer the data back to the builder.
     * @param {string} archetypeName The name of the archetype the user selected
     */
    setArchetype = (archetypeName) => {
        let idx = indexOfByName(this.state.archetypes, archetypeName);
        const selectedArchetype = this.state.archetypes[idx];
        this.setState({selectedArchetype});
        if(this.props.onSelectArchetype)
            this.props.onSelectArchetype(selectedArchetype);

    }

    render() {
        return (
            <div>
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <label className="input-group-text" htmlFor="archetype-select">Archetype: </label>
                    </div>
                    <select className="custom-select" id="archetype-select" onChange={(e) => this.setArchetype(e.target.value)} value={this.state.selectedArchetype.name}>
                        <option>Archetypes</option>
                        { this.state.archetypes.map(
                            (archetype) =>
                                <option value={archetype.name} key={archetype.name} >{archetype.display_name}</option>
                        )}
                    </select>
                </div>
            </div>
        )
    }
}

export default ArchetypeSelector;

