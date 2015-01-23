/*global _,define,App*/
define([
    'backbone',
    'mustache',
    'text!common-objects/templates/part/component_view.html',
    'common-objects/views/part/cad_instance_view'
], function (Backbone, Mustache, template, CadInstanceView) {
	'use strict';
    var ComponentView = Backbone.View.extend({

        events: {
            'click a.remove': 'onRemove',
            'change input[name=amount]': 'changeAmount',
            'change input[name=number]': 'changeNumber',
            'change input[name=name]': 'changeName',
            'change select[name=unitMeasure]': 'changeMeasureUnit',
            'click .add-cadInstance': 'addCadInstance',
            'click .collapse-cadInstance': 'collapseTransformations'
        },


        initialize: function () {
        },

        render: function () {
            this.$el.html(Mustache.render(template, {model: this.model.attributes, i18n: App.config.i18n, editMode: this.options.editMode}));
            this.bindDomElements();
            this.initCadInstanceViews();
            this.initUnit();
            return this;
        },

        bindDomElements: function () {
            this.$cadInstances = this.$('.cadInstances');
            this.$amount = this.$('input[name=amount]');
        },

        initCadInstanceViews: function () {
            var self = this;
            _(this.model.get('cadInstances')).each(function (instance) {
                self.addCadInstanceView(instance);
                self.$cadInstances.hide();
            });
        }
        ,initUnit:function(){
            var unit = this.model.get('unit');
            this.$('.unitEdit option[value='+unit+']').attr('selected','selected');
            this.disableEnableAmount(unit);
        },

    addCadInstanceView: function (instance) {
            var self = this;
            var instanceView = new CadInstanceView();
            instanceView.setInstance(instance).render();
            self.$cadInstances.append(instanceView.$el);
            instanceView.on('instance:remove', function () {
                self.onRemoveCadInstance(instance);
            });
        },

        onRemove: function () {
            if (this.options.removeHandler && this.options.editMode) {
                this.options.removeHandler();
            }
        },

        onRemoveCadInstance: function (instance) {
            this.model.set('cadInstances', _(this.model.get('cadInstances')).without(instance));
            this.$amount.val(parseInt(this.$amount.val(), 10) - 1);
        },

        addCadInstance: function () {
            var instance = {tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0};
            this.model.get('cadInstances').push(instance);
            this.addCadInstanceView(instance);
            this.$amount.val(parseInt(this.$amount.val(), 10) + 1);
        },
        collapseTransformations: function () {
           if(this.$cadInstances.is(":visible")){
               this.$cadInstances.hide();
               this.$('.collapse-cadInstance').addClass("fa-angle-double-down").removeClass("fa-angle-double-up");
           }
           else{
               this.$cadInstances.show();
               this.$('.collapse-cadInstance').removeClass("fa-angle-double-down").addClass("fa-angle-double-up");
           }

        },
        changeAmount: function (e) {
            this.model.set('amount',e.target.value);
            this.model.get('component').amount= e.target.value;
        },
        changeNumber: function (e) {
            this.model.get('component').number = e.target.value;
        },
        changeName: function (e) {
            this.model.get('component').name = e.target.value;
        },
        changeMeasureUnit: function(e){
            this.model.set('unit',e.target.value);
            this.disableEnableAmount(e.target.value);
        },
        checkIntegrity: function (unit) {

            if (unit != "unit") {
              if( this.$('.cadInstance').length > 1){
                  this.$(".cadInstance:not(:first)").remove();
                  while(this.model.get('cadInstances').length > 1){
                      this.model.get('cadInstances').pop();
                  }
              }

            } else {
                if ( parseInt(this.$amount.val()) > this.$('.cadInstance').length) {
                    while (this.$('.cadInstance').length < parseInt(this.$amount.val()) ) {
                        var instance = {tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0};
                        this.model.get('cadInstances').push(instance);
                        this.addCadInstanceView(instance);
                    }
                }
            }
        },
        disableEnableAmount: function(unit){
            if (unit != "unit"){
                this.$amount.removeAttr('disabled');
                this.$('.add-cadInstance').hide();
            }else{
                this.$amount.val(parseInt(this.$amount.val())== 0 ? 1:parseInt(this.$amount.val()));
                this.$amount.attr('disabled','disabled');
                this.$('.add-cadInstance').show();
            }
            this.checkIntegrity(unit);

         }


    });

    return ComponentView;
});
