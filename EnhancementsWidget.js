import React, { Component } from 'react';
import ToonPowers from './ToonPowers';

class EnhacementsWidget extends Component {
    /**
     * 
     * @param { } props the props being passed to this component must be the following:
     *  - toon_powers: the ToonPowers object in charge of all power assignments
     *  - powerName: the name of the power we will be dealing with the ehancements.
     *  - onEnhancementUpdate: Triggered when the user adds or removes enhancement slots
     *  - onEnhSlotSelected: Triggered when the user select a slot to attemtp to put in an enhancement.
     */
     constructor(props) {
        super(props)
        this.state = {
            toon_powers: props.toon_powers,
            powerName: props.powerName,
            enhancements: [],

            show_new_ehn_btn: false,
            delete_mode: false,
        };
    }

    componentDidMount() {

        if(this.props.toon_powers instanceof ToonPowers)
            this.setState({toon_powers: this.props.toon_powers});
        if(this.props.powerName && this.props.powerName !== '')
            this.setState({powerName: this.props.powerName});
            
        this.updateEnhancements();
    }

    componentDidUpdate(prevProps) {
        let update = false;
        if(prevProps.toon_powers !== this.props.toon_powers)
        {
            this.setState({toon_powers: this.props.toon_powers});
            update = true;
        }
            
        if(prevProps.powerName !== this.props.powerName)
        {
            this.setState({powerName: this.props.powerName});
            update = true;
        }

        if(update)
            this.updateEnhancements();
    }

    updateEnhancements()
    {
        if(this.props.toon_powers instanceof ToonPowers && this.props.powerName && this.props.powerName !== '')
        {
            this.setState({enhancements: this.props.toon_powers.getEnhancements(this.props.powerName)});
        }
    }

    addEnhancement = (e) =>
    {
        //add one
        this.state.toon_powers.addEnhancement(this.state.powerName);
        if(this.onEnhancementUpdate)
            this.onEnhancementUpdate(this.state.toon_powers);
    }

    removeEnhancement = (e) =>
    {
        //add one
        this.state.toon_powers.removeEnhancement(this.state.powerName);
        if(this.onEnhancementUpdate)
            this.onEnhancementUpdate(this.state.toon_powers);
    }

    slotEnhancement = () =>
    {
        if(this.props.onEnhSlotSelected)
            this.props.onEnhSlotSelected(this.state.powerName);
    }
    

    render()
    {
        if(!this.state.enhancements || this.state.enhancements.length === 0)
            return null;
        return (
            <div 
                className="enhancements-container" 
                ref={ref => this.enhacement_container = ref}
                onMouseEnter={(e) => { 
                    this.setState({show_new_ehn_btn: true}); 
                    if(e.shiftKey) this.setState({delete_mode: true}); 
                    else this.setState({delete_mode: false})
                }}
                onMouseLeave={() => this.setState({show_new_ehn_btn: false})}
                onMouseOver={(e) => { if(e.shiftKey) this.setState({delete_mode: true}); else this.setState({delete_mode: false}) }}
            >
                {this.state.enhancements.map(
                    (enh) => {
                        let cn = "enhancement";
                        if(!enh.name || enh.name === '')
                            cn += " empty"
                        return (
                            <button className={cn} key={enh.name + enh.level} onClick={this.slotEnhancement}> <span>{ enh.level }</span> </button>
                        );
                    }
                )}
                {this.state.show_new_ehn_btn && !this.state.delete_mode &&  this.state.toon_powers.canAddEnhancement(this.state.powerName) &&
                    (<button className="enhancement new" onClick={this.addEnhancement}><span>+</span></button>)
                }
                {this.state.show_new_ehn_btn && this.state.delete_mode &&
                    (<button className="enhancement remove" onClick={this.removeEnhancement}><span>-</span></button>)
                }
            </div>
        );
    }
}

export default EnhacementsWidget;