import DS from 'ember-data';
import { inject as service } from '@ember/service';

const { attr, belongsTo, hasMany } = DS;

export default DS.Model.extend({
  session: service(),
  store: service(),
  title: attr('string'),
  body: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  tagList: hasMany('tag'),
  description: attr('string'),
  /**
   * Author of the article.
   * Inverse option is `null` to prevent a profile from being set on the article incorrectly when a `hasMany` relationship loads articles not owned
   * by the profile, such as `favoriteArticles`.
   */
  author: belongsTo('profile', { async: false, inverse: null }),
  favorited: attr('boolean'),
  favoritesCount: attr('number'),
  comments: hasMany('comment', { inverse: 'article' }),

  async favorite() {
    await this.favoriteOperation('favorite');
  },

  async unfavorite() {
    await this.favoriteOperation('unfavorite');
  },

  async favoriteOperation(operation) {
    const payload = await this.session.fetch(
      `/articles/${this.id}/favorite`,
      operation === 'unfavorite' ? 'DELETE' : 'POST',
    );
    const store = this.store;
    const serializer = store.serializerFor('article');
    const primaryModelClass = store.modelFor('article');

    store.push(serializer.normalizeSingleResponse(store, primaryModelClass, payload, this.id));
  },
});
