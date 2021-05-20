import React, { Component } from 'react';
import EnhancementDB from './EnhancementDB';

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

    showEnhInfo = (enh) =>
    {
        let info = 
        (
            <div className="enh-info">
                <div className="power-name">{enh.Name}</div>
                <div className="power-desc">{enh.Desc}</div>
            </div>
        );
        this.setState({toolTipInfo: info});
    }

    showSetEnhInfo = (enh) =>
    {
        let info = 
        (
            <div className="enh-info">
                <div className="power-name">{enh.LongName}</div>
            </div>
        );
        this.setState({toolTipInfo: info});
    }

    getFilteredRegularEnhancements()
    {
        
    }

    render()
    {
        return (
            <div className="enhacement-selector">
                <div className="power-header">
                    PowerName
                </div>
                <br className="is-clearfix" />
                <div className="is-flex is-flex-direction-row is-justify-content-space-between is-align-content-center">
                    <div className="enh-cat">
                        <img src="/img/sets/None.png" />
                    </div>
                    <div className={"enh-cat " + (this.state.selectedCat === EnhancementDB.type.regular? 'selected': '')}>
                        <img src="/img/sets/Normal.png" onClick={() => this.setState({selectedCat: EnhancementDB.type.regular})} />
                    </div>
                    <div className={"enh-cat " + (this.state.selectedCat === EnhancementDB.type.invention? 'selected': '')}>
                        <img src="/img/sets/InventO.png" onClick={() => this.setState({selectedCat: EnhancementDB.type.invention})} />
                    </div>
                    <div className={"enh-cat " + (this.state.selectedCat === EnhancementDB.type.hamidon? 'selected': '')}>
                        <img src="/img/sets/HamiO.png" onClick={() => this.setState({selectedCat: EnhancementDB.type.hamidon})}/>
                    </div>
                    <div className={"enh-cat " + (this.state.selectedCat === EnhancementDB.type.sets? 'selected': '')}>
                        <img src="/img/sets/SetO.png" onClick={() => this.setState({selectedCat: EnhancementDB.type.sets})} />
                    </div>
                </div>
                <br className="is-clearfix" />
                <div className="columns">
                    <div className="column is-two-thirds is-flex is-flex-wrap-wrap is-align-content-flex-start enh-container">
                        {this.state.selectedCat === EnhancementDB.type.invention && 
                         this.db.getEnhacementType(this.state.selectedCat).map(
                            (enh) => 
                            {
                                let divStyle = { backgroundImage: 'url("/img/overlay/IO.png")' }
                                return (
                                    <div className="single-enhancement" onMouseOver={() => this.showEnhInfo(enh)} >
                                        <img  style={divStyle} src={this.imagePath + "enh/" + enh.Image} />
                                    </div>
                                )
                            }
                        )}
                        {this.state.selectedCat === EnhancementDB.type.regular  && 
                         this.db.getEnhacementType(this.state.selectedCat).map(
                            (enh) => 
                            {
                                let divStyle = { backgroundImage: 'url("/img/overlay/Training.png")' }
                                return (
                                    <div className="single-enhancement">
                                        <img style={divStyle} src={this.imagePath + "enh/" + enh.Image} onMouseOver={() => this.showEnhInfo(enh)}  />
                                    </div>
                                )
                            }
                        )}
                        {this.state.selectedCat === EnhancementDB.type.hamidon && 
                         this.db.getEnhacementType(this.state.selectedCat)[this.state.hamiSubType].map(
                            (enh) => 
                            {
                                let divStyle = { backgroundImage: 'url("/img/overlay/HO.png")' }
                                return (
                                    <div className="single-enhancement">
                                        <img style={divStyle} src={this.imagePath + "enh/" + enh.Image} onMouseOver={() => this.showEnhInfo(enh)}  />
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
                                let divStyle = { backgroundImage: 'url("/img/overlay/IO.png")' }
                                return (
                                    <div className="single-enhancement">
                                        <img style={divStyle} src={this.imagePath + "enh/" + enh.Image} onMouseOver={() => this.showSetEnhInfo(enh)}  />
                                    </div>
                                    )
                            }
                        )}
                    </div>
                    <div className="column enh-subcontainer">
                        {this.state.selectedCat === EnhancementDB.type.hamidon && 
                            (   
                                <div className="is-flex is-flex-direction-column ">
                                    <div className="single-enhancement">
                                        <img src="/img/sets/Hamidon.png" onClick={() => this.setState({hamiSubType: EnhancementDB.hamiTypes.hamidon})} />
                                    </div>
                                    <div className="single-enhancement">
                                    <img src="/img/sets/Hydra.png" onClick={() => this.setState({hamiSubType: EnhancementDB.hamiTypes.hydra})} />
                                    </div>
                                    <div className="single-enhancement">
                                    <img src="/img/sets/Titan.png" onClick={() => this.setState({hamiSubType: EnhancementDB.hamiTypes.titan})} />
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
                                                <div className="single-enhancement">
                                                    <img 
                                                        src={"/img/enh/" + enhSet.Image} 
                                                        style={divStyle}
                                                        onClick={() => this.setState({setSubType: enhSet.Uid})} />
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