import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import {action, computed, set} from '@ember/object';
import {utils as ghostHelperUtils} from '@tryghost/helpers';
import {isBlank} from '@ember/utils';
import {run} from '@ember/runloop';

const {countWords, countImages} = ghostHelperUtils;

@classic
export default class KoenigCardVero extends Component {
    // attrs
    payload = null;
    isSelected = false;
    isEditing = false;
    headerOffset = 0;

    // internal properties
    _input1 = '';

    // closure actions
    selectCard() {}
    deselectCard() {}
    editCard() {}
    saveCard() {}
    deleteCard() {}
    registerComponent() {}

    @computed('payload.html')
    get isEmpty() {
        return isBlank(this.payload.html);
    }

    @computed('payload.html')
    get counts() {
        return {
            wordCount: countWords(this.payload.html),
            imageCount: countImages(this.payload.html)
        };
    }

    @computed('isEditing')
    get toolbar() {
        if (this.isEditing) {
            return false;
        }

        return {
            items: [{
                buttonClass: 'fw4 flex items-center white',
                icon: 'koenig/kg-edit',
                iconClass: 'fill-white',
                title: 'Edit',
                text: '',
                action: run.bind(this, this.editCard)
            }]
        };
    }

    init() {
        super.init(...arguments);
        let payload = this.payload || {};

        // CodeMirror errors on a `null` or `undefined` value
        if (!payload.html) {
            set(payload, 'html', '');
        }

        this.set('payload', payload);

        this.registerComponent(this);
    }

    @action
    inputKeydown(event) {
        if (event.key === 'Enter') {
            // prevent Enter from triggering in the editor and removing text
            event.preventDefault();

            this._updateHtml();
            this.deselectCard();
        }
    }

    @action
    clear() {
        this.set('_input1', '');``
        this._focusInput();``
    }

    _updateHtml() {``
        this._updatePayloadAttr('html', `Vero Widget !!!!! ${this._input1}`);
    }

    @action
    leaveEditMode() {
        if (this.isEmpty) {
            // afterRender is required to avoid double modification of `isSelected`
            // TODO: see if there's a way to avoid afterRender
            run.scheduleOnce('afterRender', this, this.deleteCard);
        }
    }

    _updatePayloadAttr(attr, value) {
        let payload = this.payload;
        let save = this.saveCard;

        set(payload, attr, value);

        // update the mobiledoc and stay in edit mode
        save(payload, false);
    }
}
