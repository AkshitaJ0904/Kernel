from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('warroom', '0003_rename_video_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='VideoChapter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp_seconds', models.PositiveIntegerField(help_text='start time of this chapter, in seconds')),
                ('title', models.CharField(max_length=200)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('video', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chapters', to='warroom.video')),
            ],
            options={'ordering': ['timestamp_seconds', 'order']},
        ),
        migrations.CreateModel(
            name='VideoNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp_seconds', models.PositiveIntegerField(default=0)),
                ('body', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='video_notes', to=settings.AUTH_USER_MODEL)),
                ('video', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='warroom.video')),
            ],
            options={'ordering': ['timestamp_seconds']},
        ),
        migrations.CreateModel(
            name='VideoProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('position_seconds', models.FloatField(default=0)),
                ('duration_seconds', models.FloatField(default=0)),
                ('completed', models.BooleanField(default=False)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='video_progress', to=settings.AUTH_USER_MODEL)),
                ('video', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='progress', to='warroom.video')),
            ],
            options={'unique_together': {('user', 'video')}},
        ),
    ]
