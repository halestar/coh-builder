import React, { Component } from 'react';
import EnhancementDB from './EnhancementDB';
import { logObj } from './Helpers';

class EnhancementSelector extends Component {
    
    constructor(props) {
        super(props);
        this.imagePath = "/img/";
        this.db = props.db;
        this.state = {
            selectedCat: 1,
            hamiSubType: 1,
            setSubType: null,
            selectedPower: props.selectedPower,

            toolTipInfo: null,
        }
    }

    componentDidMount() {
        if(this.props.selectedPower)
            this.setState({selectedPower: this.props.selectedPower});
    }

    componentDidUpdate(prevProps) {
        if(this.props.selectedPower && this.props.selectedPower !== prevProps.selectedPower)
            this.setState({selectedPower: this.props.selectedPower});
    }

    showEnhInfo = (name, description) =>
    {
        let info = 
        (
            <div className="enh-info">
                <div className="power-name">{name}</div>
                <div className="power-desc">{description}</div>
            </div>
        );
        this.setState({toolTipInfo: info});
    }

    handleEnhancementSelected = (enh) =>
    {
        logObj(enh);
        if(this.props.onSlotPower)
            this.props.onSlotPower(enh);
    }

    render()
    {
        return (
            <div className="enhacement-selector">
                <div className="power-header">
                    {this.state.selectedPower.power.display_name}
                </div>
                <br className="is-clearfix" />
                <div className="is-flex is-flex-direction-row is-justify-content-space-between is-align-content-center">
                    <div className="enh-cat" onClick={ () => this.handleEnhancementSelected()}>
                        <img src="/img/sets/None.png" alt="None" onMouseOver={() => this.showEnhInfo("Remove Enhancement")}  />
                    </div>
                    <div className={"enh-cat " + (this.state.selectedCat === EnhancementDB.type.regular? 'selected': '')}>
                        <img 
                            src="/img/sets/Normal.png" 
                            alt="Training Enhancements"
                            onClick={() => this.setState({selectedCat: EnhancementDB.type.regular})} 
                            onMouseOver={() => this.showEnhInfo("Training Enhancements")}
                        />
                    </div>
                    <div className={"enh-cat " + (this.state.selectedCat === EnhancementDB.type.invention? 'selected': '')}>
                        <img 
                            src="/img/sets/InventO.png" 
                            alt="Inventions"
                            onClick={() => this.setState({selectedCat: EnhancementDB.type.invention})} 
                            onMouseOver={() => this.showEnhInfo("Inventions", "Crafted from Salvage")}
                        />
                    </div>
                    <div className={"enh-cat " + (this.state.selectedCat === EnhancementDB.type.hamidon? 'selected': '')}>
                        <img 
                            src="/img/sets/HamiO.png" 
                            alt="Hamidon enhancements"
                            onClick={() => this.setState({selectedCat: EnhancementDB.type.hamidon})}
                            onMouseOver={() => this.showEnhInfo("Special/Hami-O", "These can have multiple effects.")}
                        />
                    </div>
                    <div className={"enh-cat " + (this.state.selectedCat === EnhancementDB.type.sets? 'selected': '')}>
                        <img 
                            src="/img/sets/SetO.png" 
                            alt="invention sets"
                            onClick={() => this.setState({selectedCat: EnhancementDB.type.sets})} 
                            onMouseOver={() => this.showEnhInfo("Invention Sets", "Collecting a set will grant additional effects.")}
                        />
                    </div>
                </div>
                <br className="is-clearfix" />
                <div className="columns">
                    <div className="column is-two-thirds is-flex is-flex-wrap-wrap is-align-content-flex-start enh-container">
                        {this.state.selectedCat === EnhancementDB.type.invention && 
                         this.db.getEnhacementType(this.state.selectedCat).map(
                            (enh, index) => 
                            {
                                enh.overlay = "/img/overlay/IO.png";
                                let divStyle = { backgroundImage: 'url("/img/overlay/IO.png")' }
                                return (
                                    <div 
                                        key={index}
                                        className="single-enhancement" 
                                        onClick={ () => this.handleEnhancementSelected(enh) }
                                    >
                                        <img  
                                            style={divStyle} 
                                            src={this.imagePath + "enh/" + enh.Image} 
                                            alt={enh.display_name} 
                                            onMouseOver={() => this.showEnhInfo(enh.Name, enh.Desc)} 
                                        />
                                    </div>
                                )
                            }
                        )}
                        {this.state.selectedCat === EnhancementDB.type.regular  && 
                         this.db.getEnhacementType(this.state.selectedCat).map(
                            (enh, index) => 
                            {
                                enh.overlay = "/img/overlay/Training.png";
                                let divStyle = { backgroundImage: 'url("/img/overlay/Training.png")' }
                                return (
                                    <div 
                                        key={index}
                                        className="single-enhancement" 
                                        onClick={ () => this.handleEnhancementSelected(enh) }
                                    >
                                        <img  
                                            style={divStyle} 
                                            src={this.imagePath + "enh/" + enh.Image} 
                                            alt={enh.display_name} 
                                            onMouseOver={() => this.showEnhInfo(enh.Name, enh.Desc)} 
                                        />
                                    </div>
                                )
                            }
                        )}
                        {this.state.selectedCat === EnhancementDB.type.hamidon && 
                         this.db.getEnhacementType(this.state.selectedCat)[this.state.hamiSubType].map(
                            (enh, index) => 
                            {
                                enh.overlay = "/img/overlay/HO.png";
                                let divStyle = { backgroundImage: 'url("/img/overlay/HO.png")' }
                                return (
                                    <div 
                                        key={index}
                                        className="single-enhancement" 
                                        onClick={ () => this.handleEnhancementSelected(enh) }
                                    >
                                        <img  
                                            style={divStyle} 
                                            src={this.imagePath + "enh/" + enh.Image} 
                                            alt={enh.display_name} 
                                            onMouseOver={() => this.showEnhInfo(enh.Name, enh.Desc)} 
                                        />
                                    </div>
                                    )
                            }
                        )}
                        {this.state.selectedCat === EnhancementDB.type.sets && 
                         this.db.setEnh.filter(
                             (item) =>
                             {
                                 if(!this.state.setSubType)
                                    return false;
                                return (this.state.setSubType === item.UIDSet);
                             }
                         ).map(
                            (enh) => 
                            {
                                enh.overlay = "/img/overlay/IO.png";
                                let divStyle = { backgroundImage: 'url("/img/overlay/IO.png")' }
                                return (
                                    <div 
                                        key={enh.name}
                                        className="single-enhancement"
                                        onClick={ () => this.handleEnhancementSelected(enh) }
                                    >
                                        <img  
                                            style={divStyle} 
                                            src={this.imagePath + "enh/" + enh.Image} 
                                            alt={enh.display_name} 
                                            onMouseOver={() => this.showEnhInfo(enh.LongName)} 
                                        />
                                    </div>
                                    )
                            }
                        )}
                    </div>
                    <div className="column enh-subcontainer">
                        {this.state.selectedCat === EnhancementDB.type.hamidon && 
                            (   
                                <div className="is-flex is-flex-direction-column ">
                                    <div className={"single-enhancement " + (this.state.hamiSubType === EnhancementDB.hamiTypes.hamidon? 'selected': '')}>
                                        <img 
                                            src="/img/sets/Hamidon.png"
                                            alt="Hamidon Origin"
                                            onClick={() => this.setState({hamiSubType: EnhancementDB.hamiTypes.hamidon})} 
                                            onMouseOver={() => this.showEnhInfo("Hamidon Origin", "Hamidon/Synthetic Hamidon enhancements.")}
                                        />
                                    </div>
                                    <div className={"single-enhancement " + (this.state.hamiSubType === EnhancementDB.hamiTypes.hydra? 'selected': '')}>
                                        <img 
                                            src="/img/sets/Hydra.png" 
                                            alt="Hydra Origin"
                                            onClick={() => this.setState({hamiSubType: EnhancementDB.hamiTypes.hydra})}
                                            onMouseOver={() => this.showEnhInfo("Hydra Origin", "Reward from the Sewer Trial.")} 
                                        />
                                    </div>
                                    <div className={"single-enhancement " + (this.state.hamiSubType === EnhancementDB.hamiTypes.titan? 'selected': '')}>
                                        <img 
                                            src="/img/sets/Titan.png" 
                                            alt="Titan Origin"
                                            onClick={() => this.setState({hamiSubType: EnhancementDB.hamiTypes.titan})}
                                            onMouseOver={() => this.showEnhInfo("Titan Origin", "Reward for the Eden Trial.")}  
                                        />
                                    </div>
                                </div>
                            )
                        }
                        {this.state.selectedCat === EnhancementDB.type.sets && 
                            (   <div className="is-flex is-flex-direction-column">
                                    {this.db.db.EnhancementSets.map(
                                        (enhSet) =>
                                        {
                                            let divStyle = { backgroundImage: 'url("/img/overlay/IO.png")' }
                                            return (
                                                <div key={enhSet.Name} className={"single-enhancement " + (this.state.setSubType === enhSet.Uid? 'selected': '')}>
                                                    <img 
                                                        src={"/img/enh/" + enhSet.Image} 
                                                        alt={enhSet.DisplayName}
                                                        style={divStyle}
                                                        onClick={() => this.setState({setSubType: enhSet.Uid})}
                                                        onMouseOver={() => this.showEnhInfo(enhSet.DisplayName, enhSet.Desc)}  
                                                    />
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )
                        }
                    </div>
                </div>
                {this.state.toolTipInfo}
            </div>
        );
    }
}

export default EnhancementSelector;